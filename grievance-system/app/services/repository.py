from app.models.schemas import Grievance, GrievanceStatus


class InMemoryGrievanceRepository:
    def __init__(self) -> None:
        self._records: dict[str, Grievance] = {}

    def save(self, grievance: Grievance) -> Grievance:
        self._records[grievance.grievance_id] = grievance
        return grievance

    def get(self, grievance_id: str) -> Grievance | None:
        return self._records.get(grievance_id)

    def list(self, student_id: str | None = None) -> list[Grievance]:
        records = list(self._records.values())
        if student_id:
            records = [record for record in records if record.student_id == student_id]
        return sorted(records, key=lambda record: record.created_at, reverse=True)

    def update_status(self, grievance_id: str, status: GrievanceStatus, note: str | None) -> Grievance | None:
        grievance = self.get(grievance_id)
        if grievance is None:
            return None
        grievance.status = status
        grievance.resolution_note = note
        from datetime import datetime, timezone
        grievance.updated_at = datetime.now(timezone.utc)
        return grievance
