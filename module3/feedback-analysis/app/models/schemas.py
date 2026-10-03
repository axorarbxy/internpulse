from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class FeedbackDirection(str, Enum):
    STUDENT_TO_COMPANY = "STUDENT_TO_COMPANY"
    COMPANY_TO_STUDENT = "COMPANY_TO_STUDENT"


class FeedbackCreate(BaseModel):
    company_id: str = Field(min_length=1)
    student_id: str = Field(min_length=1)
    direction: FeedbackDirection = FeedbackDirection.STUDENT_TO_COMPANY
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=5000)


class FeedbackRecord(BaseModel):
    feedback_id: str
    company_id: str
    student_id: str
    direction: FeedbackDirection = FeedbackDirection.STUDENT_TO_COMPANY
    rating: int
    comment: str
    sentiment_score: float = Field(ge=-1.0, le=1.0)
    sentiment: SentimentLabel
    created_at: datetime


class CompanyScore(BaseModel):
    company_id: str
    feedback_count: int
    average_rating: float = Field(ge=0.0, le=5.0)
    average_sentiment: float = Field(ge=-1.0, le=1.0)
    quality_score: float = Field(ge=0.0, le=1.0)


class Theme(BaseModel):
    theme: str
    mentions: int
    share: float = Field(ge=0.0, le=1.0)


class CompanyThemes(BaseModel):
    company_id: str
    feedback_count: int
    themes: list[Theme]
