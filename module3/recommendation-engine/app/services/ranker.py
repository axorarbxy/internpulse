from app.models.schemas import Internship, Recommendation, StudentProfile
from app.services.vectorizer import normalized_skills


class RecommendationRanker:
    def __init__(self, feedback_weight: float = 0.2) -> None:
        if not 0.0 <= feedback_weight <= 1.0:
            raise ValueError("feedback_weight must be between 0 and 1")
        self.feedback_weight = feedback_weight

    def rank(
        self,
        profile: StudentProfile,
        internships: list[Internship],
        similarity_scores: list[float],
        limit: int = 10,
    ) -> list[Recommendation]:
        student_skills = normalized_skills(profile.skills)
        recommendations = []
        for internship, similarity in zip(internships, similarity_scores):
            required = normalized_skills(internship.required_skills)
            matched = sorted(student_skills & required)
            missing = sorted(required - student_skills)
            score = ((1 - self.feedback_weight) * similarity) + (
                self.feedback_weight * internship.feedback_score * similarity
            )
            recommendations.append(
                Recommendation(
                    internship_id=internship.internship_id,
                    company=internship.company,
                    title=internship.title,
                    domain=internship.domain,
                    score=round(score, 6),
                    similarity_score=round(similarity, 6),
                    feedback_score=internship.feedback_score,
                    matched_skills=matched,
                    missing_skills=missing,
                )
            )
        recommendations.sort(key=lambda item: (-item.score, item.internship_id))
        return recommendations[:limit]
