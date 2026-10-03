from __future__ import annotations

from datetime import datetime, timezone
from contextlib import contextmanager
import json
import os
import sqlite3
from collections.abc import Iterator
from pathlib import Path
from uuid import uuid4

from app.models.schemas import Flag, FlagStatus, FlagType, Severity


class FlagManager:
    def __init__(self, database_path: str | Path | None = None) -> None:
        self._flags: dict[str, Flag] = {}
        configured_dir = os.getenv("MODULE3_DATA_DIR", "").strip()
        self.database_path = Path(database_path) if database_path else (
            Path(configured_dir) / "fraud-flags.sqlite3" if configured_dir else None
        )
        if self.database_path:
            self.database_path.parent.mkdir(parents=True, exist_ok=True)
            with self._connect() as connection:
                connection.execute(
                    "CREATE TABLE IF NOT EXISTS fraud_flags (flag_id TEXT PRIMARY KEY, "
                    "status TEXT NOT NULL, created_at TEXT NOT NULL, payload TEXT NOT NULL)"
                )
                connection.execute(
                    "CREATE INDEX IF NOT EXISTS idx_fraud_flags_status_date "
                    "ON fraud_flags(status, created_at DESC)"
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

    def _save(self, flag: Flag) -> None:
        if not self.database_path:
            self._flags[flag.flag_id] = flag
            return
        payload = flag.model_dump(mode="json")
        with self._connect() as connection:
            connection.execute(
                "INSERT INTO fraud_flags(flag_id, status, created_at, payload) VALUES (?, ?, ?, ?) "
                "ON CONFLICT(flag_id) DO UPDATE SET status=excluded.status, payload=excluded.payload",
                (flag.flag_id, flag.status.value, flag.created_at.isoformat(), json.dumps(payload)),
            )

    def _get(self, flag_id: str) -> Flag | None:
        if not self.database_path:
            return self._flags.get(flag_id)
        with self._connect() as connection:
            row = connection.execute("SELECT payload FROM fraud_flags WHERE flag_id=?", (flag_id,)).fetchone()
        return Flag.model_validate(json.loads(row["payload"])) if row else None

    def create(
        self,
        student_id: str,
        subject_id: str,
        flag_type: FlagType,
        score: float,
        evidence: list[str],
        advisory: str,
    ) -> Flag:
        severity = Severity.HIGH if score >= 0.75 else Severity.MEDIUM if score >= 0.4 else Severity.LOW
        now = datetime.now(timezone.utc)
        flag = Flag(
            flag_id=f"FLG-{uuid4().hex[:10].upper()}",
            student_id=student_id,
            subject_id=subject_id,
            flag_type=flag_type,
            severity=severity,
            score=score,
            evidence=evidence,
            advisory=advisory,
            created_at=now,
        )
        self._save(flag)
        return flag

    def list(self, status: FlagStatus | None = None) -> list[Flag]:
        if self.database_path:
            with self._connect() as connection:
                if status:
                    rows = connection.execute(
                        "SELECT payload FROM fraud_flags WHERE status=? ORDER BY created_at DESC",
                        (status.value,),
                    ).fetchall()
                else:
                    rows = connection.execute(
                        "SELECT payload FROM fraud_flags ORDER BY created_at DESC"
                    ).fetchall()
            flags = [Flag.model_validate(json.loads(row["payload"])) for row in rows]
        else:
            flags = list(self._flags.values())
        if status:
            flags = [flag for flag in flags if flag.status is status]
        return sorted(flags, key=lambda flag: flag.created_at, reverse=True)

    def unpublished(self) -> list[Flag]:
        return [flag for flag in self.list() if not flag.published_to_module4]

    def resolve(self, flag_id: str) -> Flag | None:
        flag = self._get(flag_id)
        if flag is None:
            return None
        flag.status = FlagStatus.RESOLVED
        flag.resolved_at = datetime.now(timezone.utc)
        self._save(flag)
        return flag
