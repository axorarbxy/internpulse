import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from collections.abc import Iterator
from pathlib import Path

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


class SQLiteGrievanceRepository:
    def __init__(self, database_path: str | Path) -> None:
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.execute(
                "CREATE TABLE IF NOT EXISTS grievances ("
                "grievance_id TEXT PRIMARY KEY, student_id TEXT NOT NULL, "
                "created_at TEXT NOT NULL, payload TEXT NOT NULL)"
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_grievances_student_date "
                "ON grievances(student_id, created_at DESC)"
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

    def save(self, grievance: Grievance) -> Grievance:
        payload = grievance.model_dump(mode="json")
        with self._connect() as connection:
            connection.execute(
                "INSERT INTO grievances(grievance_id, student_id, created_at, payload) "
                "VALUES (?, ?, ?, ?) ON CONFLICT(grievance_id) DO UPDATE SET "
                "student_id=excluded.student_id, created_at=excluded.created_at, payload=excluded.payload",
                (grievance.grievance_id, grievance.student_id, grievance.created_at.isoformat(), json.dumps(payload)),
            )
        return grievance

    def get(self, grievance_id: str) -> Grievance | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT payload FROM grievances WHERE grievance_id=?",
                (grievance_id,),
            ).fetchone()
        return Grievance.model_validate(json.loads(row["payload"])) if row else None

    def list(self, student_id: str | None = None) -> list[Grievance]:
        query = "SELECT payload FROM grievances"
        parameters: tuple[str, ...] = ()
        if student_id:
            query += " WHERE student_id=?"
            parameters = (student_id,)
        query += " ORDER BY created_at DESC"
        with self._connect() as connection:
            rows = connection.execute(query, parameters).fetchall()
        return [Grievance.model_validate(json.loads(row["payload"])) for row in rows]

    def update_status(self, grievance_id: str, status: GrievanceStatus, note: str | None) -> Grievance | None:
        grievance = self.get(grievance_id)
        if grievance is None:
            return None
        grievance.status = status
        grievance.resolution_note = note
        grievance.updated_at = datetime.now(timezone.utc)
        return self.save(grievance)


def create_repository() -> InMemoryGrievanceRepository | SQLiteGrievanceRepository:
    data_dir = os.getenv("MODULE3_DATA_DIR", "").strip()
    if not data_dir:
        return InMemoryGrievanceRepository()
    return SQLiteGrievanceRepository(Path(data_dir) / "grievances.sqlite3")
