from datetime import datetime, timezone
from uuid import uuid4

from app.models.schemas import Flag, FlagStatus, FlagType, Severity


class FlagManager:
    def __init__(self) -> None:
        self._flags: dict[str, Flag] = {}

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
        self._flags[flag.flag_id] = flag
        return flag

    def list(self, status: FlagStatus | None = None) -> list[Flag]:
        flags = list(self._flags.values())
        if status:
            flags = [flag for flag in flags if flag.status is status]
        return sorted(flags, key=lambda flag: flag.created_at, reverse=True)

    def resolve(self, flag_id: str) -> Flag | None:
        flag = self._flags.get(flag_id)
        if flag is None:
            return None
        flag.status = FlagStatus.RESOLVED
        flag.resolved_at = datetime.now(timezone.utc)
        return flag
