from datetime import datetime

from pydantic import BaseModel, Field


class FAQEntry(BaseModel):
    faq_id: str
    question: str
    answer: str
    keywords: list[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    student_id: str = Field(min_length=1)
    message: str = Field(min_length=1, max_length=4000)
    session_id: str | None = None


class ConversationMessage(BaseModel):
    role: str
    content: str
    created_at: datetime


class ChatResponse(BaseModel):
    student_id: str
    session_id: str
    response: str
    source: str
    confidence: float = Field(ge=0.0, le=1.0)
    escalated: bool = False
    ticket_id: str | None = None


class ChatHistoryResponse(BaseModel):
    student_id: str
    session_id: str | None = None
    messages: list[ConversationMessage]


class EscalateRequest(BaseModel):
    student_id: str = Field(min_length=1)
    session_id: str | None = None
    message: str | None = Field(default=None, max_length=4000)


class EscalationResponse(BaseModel):
    ticket_id: str
    student_id: str
    status: str
    message: str
