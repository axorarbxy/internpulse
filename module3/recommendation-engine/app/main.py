from fastapi import FastAPI, HTTPException, Query

from app.models.schemas import ReindexResponse, RecommendationResponse, SkillGapResponse
from app.services.engine import RecommendationEngine

app = FastAPI(
    title="Skill Analysis & Internship Recommendation Engine",
    version="1.0.0",
    description="TF-IDF internship matching with skill-gap analysis and feedback-aware ranking.",
)
engine = RecommendationEngine()


def get_profile(student_id: str):
    profile = engine.repository.get_student(student_id)
    if profile is None:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' was not found")
    return profile


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/recommendations/{student_id}", response_model=RecommendationResponse)
def recommendations(
    student_id: str,
    limit: int = Query(default=10, ge=1, le=50),
) -> RecommendationResponse:
    return engine.recommend(get_profile(student_id), limit)


@app.get("/skill-gaps/{student_id}", response_model=SkillGapResponse)
def skill_gaps(student_id: str) -> SkillGapResponse:
    return engine.skill_gaps(get_profile(student_id))


@app.post("/reindex", response_model=ReindexResponse)
def reindex() -> ReindexResponse:
    count = engine.reindex()
    return ReindexResponse(indexed_internships=count, vocabulary_size=engine.vectorizer.vocabulary_size)
