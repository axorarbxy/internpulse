from datetime import datetime, timezone
from uuid import uuid4

from app.models.schemas import CompanyScore, CompanyThemes, FeedbackCreate, FeedbackDirection, FeedbackRecord, Theme
from app.services.repository import InMemoryFeedbackRepository, SQLiteFeedbackRepository, create_repository
from app.services.scorer import CompanyScorer
from app.services.sentiment import SentimentAnalyzer
from app.services.themes import ThemeExtractor


class FeedbackManager:
    def __init__(self, repository: InMemoryFeedbackRepository | SQLiteFeedbackRepository | None = None) -> None:
        self.repository = repository or create_repository()
        self.sentiment = SentimentAnalyzer()
        self.theme_extractor = ThemeExtractor()
        self.scorer = CompanyScorer()

    def submit(self, request: FeedbackCreate) -> FeedbackRecord:
        score, label = self.sentiment.analyze(request.comment)
        record = FeedbackRecord(
            feedback_id=f"FDB-{uuid4().hex[:10].upper()}",
            company_id=request.company_id,
            student_id=request.student_id,
            direction=request.direction,
            rating=request.rating,
            comment=request.comment,
            sentiment_score=score,
            sentiment=label,
            created_at=datetime.now(timezone.utc),
        )
        return self.repository.add(record)

    def score(self, company_id: str) -> CompanyScore:
        feedback = [record for record in self.repository.for_company(company_id) if record.direction == FeedbackDirection.STUDENT_TO_COMPANY]
        return self.scorer.score(company_id, feedback)

    def themes(self, company_id: str) -> CompanyThemes:
        records = [record for record in self.repository.for_company(company_id) if record.direction == FeedbackDirection.STUDENT_TO_COMPANY]
        themes = self.theme_extractor.extract([record.comment for record in records])
        return CompanyThemes(company_id=company_id, feedback_count=len(records), themes=themes)

    def for_company(self, company_id: str) -> list[FeedbackRecord]:
        return self.repository.for_company(company_id)

    def for_student(self, student_id: str) -> list[FeedbackRecord]:
        return self.repository.for_student(student_id)
