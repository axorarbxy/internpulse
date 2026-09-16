from app.models.schemas import FeedbackRecord


class InMemoryFeedbackRepository:
    def __init__(self) -> None:
        self._records: dict[str, list[FeedbackRecord]] = {}

    def add(self, feedback: FeedbackRecord) -> FeedbackRecord:
        self._records.setdefault(feedback.company_id, []).append(feedback)
        return feedback

    def for_company(self, company_id: str) -> list[FeedbackRecord]:
        return list(self._records.get(company_id, []))
