from collections import Counter, defaultdict

from app.models.schemas import RecommendationResponse, SkillGap, SkillGapResponse, StudentProfile
from app.services.feedback_client import FeedbackScoreClient
from app.services.ranker import RecommendationRanker
from app.services.repository import InMemoryRepository
from app.services.vectorizer import SkillVectorizer, normalized_skills


class RecommendationEngine:
    def __init__(
        self,
        repository: InMemoryRepository | None = None,
        feedback_provider: FeedbackScoreClient | None = None,
    ) -> None:
        self.repository = repository or InMemoryRepository()
        self.feedback_provider = feedback_provider or FeedbackScoreClient()
        self.vectorizer = SkillVectorizer()
        self.ranker = RecommendationRanker()
        self.reindex()

    def reindex(self) -> int:
        return self.vectorizer.fit(self.repository.list_internships())

    def recommend(self, profile: StudentProfile, limit: int = 10) -> RecommendationResponse:
        internships = self._with_feedback_scores(self.repository.list_internships())
        scores = self.vectorizer.similarity_scores(profile)
        return RecommendationResponse(
            student_id=profile.student_id,
            recommendations=self.ranker.rank(profile, internships, scores, limit),
        )

    def _with_feedback_scores(self, internships):
        updated = []
        for internship in internships:
            score = self.feedback_provider.get_quality_score(internship.company)
            updated.append(
                internship.model_copy(update={"feedback_score": score})
                if score is not None
                else internship
            )
        return updated

    def skill_gaps(self, profile: StudentProfile) -> SkillGapResponse:
        student_skills = normalized_skills(profile.skills)
        counts: Counter[str] = Counter()
        roles: defaultdict[str, list[str]] = defaultdict(list)
        domain = profile.target_domain.lower() if profile.target_domain else None
        for internship in self.repository.list_internships():
            if domain and internship.domain.lower() != domain:
                continue
            for skill in normalized_skills(internship.required_skills) - student_skills:
                counts[skill] += 1
                if internship.title not in roles[skill]:
                    roles[skill].append(internship.title)
        gaps = [
            SkillGap(skill=skill, internship_count=count, example_roles=roles[skill][:3])
            for skill, count in counts.most_common()
        ]
        return SkillGapResponse(student_id=profile.student_id, target_domain=profile.target_domain, gaps=gaps)
