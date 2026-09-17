from datetime import datetime, timezone
from uuid import uuid4

from app.models.schemas import CompanyScore, CompanyThemes, FeedbackCreate, FeedbackRecord, Theme
from app.services.repository import InMemoryFeedbackRepository
from app.services.scorer import CompanyScorer
from app.services.sentiment import SentimentAnalyzer
from app.services.themes import ThemeExtractor


class FeedbackManager:
    def __init__(self, repository: InMemoryFeedbackRepository | None = None) -> None:
        self.repository = repository or InMemoryFeedbackRepository()
        self.sentiment = SentimentAnalyzer()
        self.theme_extractor = ThemeExtractor()
        self.scorer = CompanyScorer()

    def submit(self, request: FeedbackCreate) -> FeedbackRecord:
        score, label = self.sentiment.analyze(request.comment)
        record = FeedbackRecord(
            feedback_id=f"FDB-{uuid4().hex[:10].upper()}",
            company_id=request.company_id,
            student_id=request.student_id,
            rating=request.rating,
            comment=request.comment,
            sentiment_score=score,
            sentiment=label,
            created_at=datetime.now(timezone.utc),
        )
        return self.repository.add(record)

    def score(self, company_id: str) -> CompanyScore:
        return self.scorer.score(company_id, self.repository.for_company(company_id))

    def themes(self, company_id: str) -> CompanyThemes:
        records = self.repository.for_company(company_id)
        themes = self.theme_extractor.extract([record.comment for record in records])
        return CompanyThemes(company_id=company_id, feedback_count=len(records), themes=themes)
