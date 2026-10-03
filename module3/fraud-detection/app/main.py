import hmac
import os

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse

from app.models.schemas import (
    ActivityAnalysisRequest,
    ActivityAnalysisResponse,
    ContentAnalysisRequest,
    ContentAnalysisResponse,
    DocumentHandoffRequest,
    Flag,
    FlagListResponse,
    FlagStatus,
    FlagType,
    ResolveFlagRequest,
)
from app.services.activity_anomaly import ActivityAnomalyDetector
from app.services.content_analyzer import ContentAnalyzer
from app.services.flag_manager import FlagManager
from app.services.grievance_client import GrievanceReviewClient
from app.services.document_verification_client import DocumentVerificationClient

app = FastAPI(
    title="Fraud & Content-Authenticity Detection",
    version="1.0.0",
    description="Advisory analysis that surfaces review flags and never auto-rejects submissions.",
)
service_key = os.getenv("CORE_SERVICE_KEY", "").strip()


@app.middleware("http")
async def require_internal_service_key(request, call_next):
    if request.url.path == "/health" or not service_key:
        return await call_next(request)
    supplied_key = request.headers.get("X-Internal-Service-Key", "")
    if not hmac.compare_digest(supplied_key, service_key):
        return JSONResponse(status_code=401, content={"detail": "Service authentication required"})
    return await call_next(request)


content_analyzer = ContentAnalyzer()
activity_detector = ActivityAnomalyDetector()
flags = FlagManager()
grievance_client = GrievanceReviewClient()
document_verification_client = DocumentVerificationClient()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "policy": "advisory_only"}


@app.post("/analyze/content", response_model=ContentAnalysisResponse)
def analyze_content(request: ContentAnalysisRequest) -> ContentAnalysisResponse:
    result = content_analyzer.analyze(request.content, request.metadata)
    flag_id = None
    if result.score >= 0.4:
        flag = flags.create(
            student_id=request.student_id,
            subject_id=request.submission_id,
            flag_type=FlagType.CONTENT_AUTHENTICITY,
            score=result.score,
            evidence=result.signals,
            advisory="Signals warrant institution review; this is not an authorship determination or rejection.",
        )
        grievance_client.create_review_case(request.student_id, "Content authenticity review", result.signals)
        document_verification_client.publish_flag(
            document_id=request.submission_id,
            internship_id=request.internship_id,
            score=result.score,
            reason="; ".join(result.signals)[:2000],
            flag_id=flag.flag_id,
            student_id=request.student_id,
            flag_type=flag.flag_type.value,
        )
        flag.published_to_module4 = document_verification_client.publish_flag(
            document_id=request.submission_id,
            internship_id=request.internship_id,
            score=result.score,
            reason="; ".join(result.signals)[:2000],
            flag_id=flag.flag_id,
            student_id=request.student_id,
            flag_type=flag.flag_type.value,
        )
        flags._save(flag)
        flag_id = flag.flag_id
    return ContentAnalysisResponse(
        submission_id=request.submission_id,
        authenticity_score=result.score,
        signals=result.signals,
        advisory="Results are advisory only and require human review.",
        flag_id=flag_id,
    )


@app.post("/analyze/activity/{internship_id}", response_model=ActivityAnalysisResponse)
def analyze_activity(internship_id: str, request: ActivityAnalysisRequest) -> ActivityAnalysisResponse:
    result = activity_detector.analyze(request.events, request.deadline)
    flag_id = None
    if result.score >= 0.4:
        flag = flags.create(
            student_id=request.student_id,
            subject_id=internship_id,
            flag_type=FlagType.ACTIVITY_ANOMALY,
            score=result.score,
            evidence=result.anomalies,
            advisory="Activity pattern warrants institution review; it is not proof of fraudulent participation.",
        )
        grievance_client.create_review_case(
            request.student_id,
            f"Activity review for {internship_id}",
            result.anomalies,
        )
        published = document_verification_client.publish_flag(
            document_id=internship_id,
            internship_id=internship_id,
            score=result.score,
            reason="; ".join(result.anomalies)[:2000],
            flag_id=flag.flag_id,
            student_id=request.student_id,
            flag_type=flag.flag_type.value,
        )
        flag.published_to_module4 = published
        flags._save(flag)
        flag_id = flag.flag_id
    return ActivityAnalysisResponse(
        internship_id=internship_id,
        anomaly_score=result.score,
        anomalies=result.anomalies,
        advisory="Results are advisory only and require human review.",
        flag_id=flag_id,
    )


@app.post("/handoffs/document", response_model=Flag, status_code=201)
def document_handoff(request: DocumentHandoffRequest) -> Flag:
    score = request.verification_score if request.verification_score is not None else 0.8
    flag = flags.create(
        student_id=request.student_id,
        subject_id=request.document_id,
        flag_type=FlagType.SUSPICIOUS_DOCUMENT,
        score=score,
        evidence=[request.reason],
        advisory="Document verification raised a concern; an institution reviewer must assess it.",
    )
    grievance_client.create_review_case(request.student_id, "Suspicious document review", [request.reason])
    published = document_verification_client.publish_flag(
        document_id=request.document_id,
        internship_id=request.internship_id,
        score=score,
        reason=request.reason,
        flag_id=flag.flag_id,
        student_id=request.student_id,
        flag_type=flag.flag_type.value,
    )
    flag.published_to_module4 = published
    flags._save(flag)
    return flag


@app.get("/flags", response_model=FlagListResponse)
def list_flags(status: FlagStatus | None = Query(default=None)) -> FlagListResponse:
    records = flags.list(status)
    return FlagListResponse(flags=records, total=len(records))


@app.post("/flags/resync", response_model=FlagListResponse)
def resync_flags() -> FlagListResponse:
    synced = []
    for flag in flags.list():
        if flag.published_to_module4:
            synced.append(flag)
            continue
        reason = "; ".join(flag.evidence)[:2000]
        published = document_verification_client.publish_flag(
            document_id=flag.subject_id,
            internship_id=flag.subject_id if flag.flag_type == FlagType.ACTIVITY_ANOMALY else None,
            score=flag.score,
            reason=reason,
            flag_id=flag.flag_id,
            student_id=flag.student_id,
            flag_type=flag.flag_type.value,
        )
        flag.published_to_module4 = published
        flags._save(flag)
        synced.append(flag)
    return FlagListResponse(flags=synced, total=len(synced))


@app.patch("/flags/{flag_id}/resolve", response_model=Flag)
def resolve_flag(flag_id: str, request: ResolveFlagRequest | None = None) -> Flag:
    request = request or ResolveFlagRequest()
    flag = next((item for item in flags.list() if item.flag_id == flag_id), None)
    if flag is None:
        raise HTTPException(status_code=404, detail="Flag not found")
    if flag.published_to_module4 and not document_verification_client.publish_resolution(
        flag.flag_id,
        request.outcome.value,
        request.resolution_note,
        request.reviewed_by,
    ):
        raise HTTPException(status_code=502, detail="Unable to synchronize review outcome with certificate verification")
    return flags.resolve(flag_id)
