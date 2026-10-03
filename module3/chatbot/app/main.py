import hmac
import os

from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse

from app.knowledge_base.faqs import FAQS
from app.models.schemas import (
    ChatHistoryResponse,
    ChatRequest,
    ChatResponse,
    EscalateRequest,
    EscalationResponse,
)
from app.services.escalation import GrievanceEscalator
from app.services.llm_client import LLMClient
from app.services.retriever import FAQRetriever
from app.sessions.store import create_session_store

app = FastAPI(
    title="Student AI Chatbot",
    version="1.0.0",
    description="Retrieval-augmented FAQ support with optional LLM generation and grievance escalation.",
)
service_key = os.getenv("CORE_SERVICE_KEY", "").strip()


@app.middleware("http")
async def require_internal_service_key(request, call_next):
    if request.url.path == "/health" or not service_key:
        return await call_next(request)
    supplied_key = request.headers.get("X-Internal-Service-Key", "")
    if not hmac.compare_digest(supplied_key, service_key):
        return JSONResponse(status_code=401, content={"detail": "Service authentication required"})
    return await call_next(request)


retriever = FAQRetriever(FAQS)
sessions = create_session_store()
llm = LLMClient()
escalator = GrievanceEscalator()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    session_id = request.session_id or sessions.new_session_id(request.student_id)
    sessions.append(request.student_id, session_id, "user", request.message)
    history = sessions.history(request.student_id, session_id)[1]
    result = retriever.retrieve(request.message)
    if result.faq is None:
        ticket = await escalator.escalate(request.student_id, request.message)
        response = f"I couldn't find a reliable answer, so I escalated this to support. Ticket: {ticket.ticket_id}."
        sessions.append(request.student_id, session_id, "assistant", response)
        return ChatResponse(
            student_id=request.student_id,
            session_id=session_id,
            response=response,
            source="grievance",
            confidence=result.score,
            escalated=True,
            ticket_id=ticket.ticket_id,
        )
    response = await llm.answer(request.message, result.faq, history) or result.faq.answer
    sessions.append(request.student_id, session_id, "assistant", response)
    return ChatResponse(
        student_id=request.student_id,
        session_id=session_id,
        response=response,
        source="llm+faq" if llm.configured else "faq",
        confidence=result.score,
    )


@app.get("/chat/history/{student_id}", response_model=ChatHistoryResponse)
def chat_history(
    student_id: str,
    session_id: str | None = Query(default=None),
) -> ChatHistoryResponse:
    selected_session, messages = sessions.history(student_id, session_id)
    return ChatHistoryResponse(student_id=student_id, session_id=selected_session, messages=messages)


@app.post("/chat/escalate", response_model=EscalationResponse)
async def escalate(request: EscalateRequest) -> EscalationResponse:
    message = request.message or "Student requested manual support escalation."
    return await escalator.escalate(request.student_id, message)
