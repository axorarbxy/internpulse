from pydantic import BaseModel, Field


class StudentProfile(BaseModel):
    student_id: str
    skills: list[str] = Field(default_factory=list)
    resume_text: str | None = None
    target_domain: str | None = None


class Internship(BaseModel):
    internship_id: str
    company: str
    title: str
    domain: str
    required_skills: list[str] = Field(default_factory=list)
    feedback_score: float = Field(default=1.0, ge=0.0, le=1.0)
    feedback_count: int = Field(default=0, ge=0)
    description: str = ""


class Recommendation(BaseModel):
    internship_id: str
    company: str
    title: str
    domain: str
    score: float = Field(ge=0.0, le=1.0)
    similarity_score: float = Field(ge=0.0, le=1.0)
    feedback_score: float = Field(ge=0.0, le=1.0)
    matched_skills: list[str]
    missing_skills: list[str]


class RecommendationResponse(BaseModel):
    student_id: str
    recommendations: list[Recommendation]


class SkillGap(BaseModel):
    skill: str
    internship_count: int
    example_roles: list[str]


class SkillGapResponse(BaseModel):
    student_id: str
    target_domain: str | None = None
    gaps: list[SkillGap]


class ReindexResponse(BaseModel):
    indexed_internships: int
    vocabulary_size: int
