from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class GrievanceCategory(str, Enum):
    CERTIFICATE = "certificate"
    COMPANY_UNRESPONSIVE = "company_unresponsive"
    PAYMENT = "payment"
    APPLICATION = "application"
    PLATFORM = "platform"
    OTHER = "other"


class Urgency(str, Enum):
    ROUTINE = "routine"
    URGENT = "urgent"


class GrievanceStatus(str, Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"


class GrievanceCreate(BaseModel):
    student_id: str = Field(min_length=1)
    subject: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    source: str = Field(default="student", min_length=1)


class StatusUpdate(BaseModel):
    status: GrievanceStatus
    resolution_note: str | None = Field(default=None, max_length=5000)


class Grievance(BaseModel):
    grievance_id: str
    student_id: str
    subject: str
    description: str
    source: str
    category: GrievanceCategory
    urgency: Urgency
    status: GrievanceStatus
    assigned_team: str
    routed_to: str
    requires_human_review: bool
    suggested_resolution: str
    resolution_note: str | None = None
    created_at: datetime
    updated_at: datetime


class GrievanceListResponse(BaseModel):
    grievances: list[Grievance]
    total: int
