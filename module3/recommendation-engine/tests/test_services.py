from app.models.schemas import Internship, StudentProfile
from app.services.engine import RecommendationEngine
from app.services.ranker import RecommendationRanker


def test_low_feedback_score_reduces_final_score():
    profile = StudentProfile(student_id="s", skills=["python"])
    internships = [
        Internship(
            internship_id="high",
            company="Good Co",
            title="Python Intern",
            domain="software engineering",
            required_skills=["python"],
            feedback_score=1.0,
        ),
        Internship(
            internship_id="low",
            company="Poor Co",
            title="Python Intern",
            domain="software engineering",
            required_skills=["python"],
            feedback_score=0.0,
        ),
    ]
    result = RecommendationRanker().rank(profile, internships, [0.8, 0.8])
    assert result[0].internship_id == "high"
    assert result[0].score > result[1].score


class FakeFeedbackProvider:
    def get_quality_score(self, company_id: str) -> float | None:
        return 0.1 if company_id == "Northstar Labs" else None


def test_recommendation_engine_consumes_feedback_quality_score():
    engine = RecommendationEngine(feedback_provider=FakeFeedbackProvider())
    response = engine.recommend(
        StudentProfile(student_id="s", skills=["python", "sql", "fastapi", "git"])
    )
    northstar = next(item for item in response.recommendations if item.company == "Northstar Labs")
    assert northstar.feedback_score == 0.1
