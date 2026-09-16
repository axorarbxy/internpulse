from fastapi import FastAPI

from app.models.schemas import CompanyScore, CompanyThemes, FeedbackCreate, FeedbackRecord
from app.services.manager import FeedbackManager

app = FastAPI(
    title="Company-Wise Feedback Analysis",
    version="1.0.0",
    description="Sentiment, theme extraction, and recommendation-ready company quality scores.",
)
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
