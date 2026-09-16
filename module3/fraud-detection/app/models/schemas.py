from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class FlagStatus(str, Enum):
    PENDING = "pending"
    RESOLVED = "resolved"


class FlagType(str, Enum):
    CONTENT_AUTHENTICITY = "content_authenticity"
    ACTIVITY_ANOMALY = "activity_anomaly"
    SUSPICIOUS_DOCUMENT = "suspicious_document"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ContentAnalysisRequest(BaseModel):
    student_id: str = Field(min_length=1)
    submission_id: str = Field(min_length=1)
    content: str = Field(min_length=20, max_length=200000)
    file_name: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ContentAnalysisResponse(BaseModel):
    submission_id: str
    authenticity_score: float = Field(ge=0.0, le=1.0)
    signals: list[str]
    advisory: str
    flag_id: str | None = None


class ActivityEvent(BaseModel):
    timestamp: datetime
    event_type: str = Field(min_length=1)
    progress_percent: float = Field(default=0.0, ge=0.0, le=100.0)
    duration_minutes: float = Field(default=0.0, ge=0.0)


class ActivityAnalysisRequest(BaseModel):
    student_id: str = Field(min_length=1)
    events: list[ActivityEvent] = Field(min_length=1)
    deadline: datetime | None = None


class ActivityAnalysisResponse(BaseModel):
    internship_id: str
    anomaly_score: float = Field(ge=0.0, le=1.0)
    anomalies: list[str]
    advisory: str
    flag_id: str | None = None


class DocumentHandoffRequest(BaseModel):
    student_id: str = Field(min_length=1)
    document_id: str = Field(min_length=1)
    reason: str = Field(min_length=1, max_length=2000)
    verification_score: float | None = Field(default=None, ge=0.0, le=1.0)


class Flag(BaseModel):
    flag_id: str
    student_id: str
    subject_id: str
    flag_type: FlagType
    severity: Severity
    score: float = Field(ge=0.0, le=1.0)
    evidence: list[str]
    status: FlagStatus = FlagStatus.PENDING
    advisory: str
    created_at: datetime
    resolved_at: datetime | None = None


class FlagListResponse(BaseModel):
    flags: list[Flag]
    total: int


class ResolveFlagRequest(BaseModel):
    resolution_note: str | None = Field(default=None, max_length=2000)
