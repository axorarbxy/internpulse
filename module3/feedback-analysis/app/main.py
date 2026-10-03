import hmac
import os

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.models.schemas import CompanyScore, CompanyThemes, FeedbackCreate, FeedbackDirection, FeedbackRecord
from app.services.manager import FeedbackManager

app = FastAPI(
    title="Company-Wise Feedback Analysis",
    version="1.0.0",
    description="Sentiment, theme extraction, and recommendation-ready company quality scores.",
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


manager = FeedbackManager()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/feedback", response_model=FeedbackRecord, status_code=201)
def submit_feedback(request: FeedbackCreate) -> FeedbackRecord:
    return manager.submit(request)


@app.get("/companies/{company_id}/score", response_model=CompanyScore)
def company_score(company_id: str) -> CompanyScore:
    return manager.score(company_id)


@app.get("/companies/{company_id}/themes", response_model=CompanyThemes)
def company_themes(company_id: str) -> CompanyThemes:
    return manager.themes(company_id)


@app.get("/companies/{company_id}/feedback", response_model=list[FeedbackRecord])
def company_feedback(
    company_id: str,
    direction: FeedbackDirection | None = None,
) -> list[FeedbackRecord]:
    records = manager.for_company(company_id)
    return [record for record in records if direction is None or record.direction == direction]


@app.get("/students/{student_id}/feedback", response_model=list[FeedbackRecord])
def student_feedback(student_id: str) -> list[FeedbackRecord]:
    return manager.for_student(student_id)
