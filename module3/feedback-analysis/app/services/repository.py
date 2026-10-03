import json
import os
import sqlite3
from contextlib import contextmanager
from collections.abc import Iterator
from pathlib import Path

from app.models.schemas import FeedbackRecord


class InMemoryFeedbackRepository:
    def __init__(self) -> None:
        self._records: dict[str, list[FeedbackRecord]] = {}

    def add(self, feedback: FeedbackRecord) -> FeedbackRecord:
        self._records.setdefault(feedback.company_id, []).append(feedback)
        return feedback

    def for_company(self, company_id: str) -> list[FeedbackRecord]:
        return list(self._records.get(company_id, []))

    def for_student(self, student_id: str) -> list[FeedbackRecord]:
        return [
            record
            for records in self._records.values()
            for record in records
            if record.student_id == student_id
        ]


class SQLiteFeedbackRepository:
    def __init__(self, database_path: str | Path) -> None:
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.execute(
                "CREATE TABLE IF NOT EXISTS feedback_records ("
                "feedback_id TEXT PRIMARY KEY, company_id TEXT NOT NULL, student_id TEXT NOT NULL, "
                "direction TEXT NOT NULL DEFAULT 'STUDENT_TO_COMPANY', "
                "created_at TEXT NOT NULL, payload TEXT NOT NULL)"
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_feedback_company_date "
                "ON feedback_records(company_id, created_at DESC)"
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_feedback_student_date "
                "ON feedback_records(student_id, created_at DESC)"
            )

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.database_path, timeout=30)
        connection.row_factory = sqlite3.Row
        try:
            yield connection
            connection.commit()
        except BaseException:
            connection.rollback()
            raise
        finally:
            connection.close()

    def add(self, feedback: FeedbackRecord) -> FeedbackRecord:
        payload = feedback.model_dump(mode="json")
        with self._connect() as connection:
            connection.execute(
                "INSERT INTO feedback_records(feedback_id, company_id, student_id, direction, created_at, payload) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (feedback.feedback_id, feedback.company_id, feedback.student_id, feedback.direction.value, feedback.created_at.isoformat(), json.dumps(payload)),
            )
        return feedback

    def for_company(self, company_id: str) -> list[FeedbackRecord]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT payload FROM feedback_records WHERE company_id=? ORDER BY created_at DESC",
                (company_id,),
            ).fetchall()
        return [FeedbackRecord.model_validate(json.loads(row["payload"])) for row in rows]

    def for_student(self, student_id: str) -> list[FeedbackRecord]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT payload FROM feedback_records WHERE student_id=? ORDER BY created_at DESC",
                (student_id,),
            ).fetchall()
        return [FeedbackRecord.model_validate(json.loads(row["payload"])) for row in rows]


def create_repository() -> InMemoryFeedbackRepository | SQLiteFeedbackRepository:
    data_dir = os.getenv("MODULE3_DATA_DIR", "").strip()
    if not data_dir:
        return InMemoryFeedbackRepository()
    return SQLiteFeedbackRepository(Path(data_dir) / "feedback.sqlite3")
