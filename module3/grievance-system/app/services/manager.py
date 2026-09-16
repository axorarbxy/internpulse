from datetime import datetime, timezone
from uuid import uuid4

from app.models.schemas import Grievance, GrievanceCreate, GrievanceStatus
from app.services.classifier import GrievanceClassifier
from app.services.repository import InMemoryGrievanceRepository
from app.services.resolver import ResolutionDraftService
from app.services.router import GrievanceRouter


class GrievanceManager:
    def __init__(self, repository: InMemoryGrievanceRepository | None = None) -> None:
        self.repository = repository or InMemoryGrievanceRepository()
        self.classifier = GrievanceClassifier()
        self.resolver = ResolutionDraftService()
        self.router = GrievanceRouter()

    def create(self, request: GrievanceCreate) -> Grievance:
        triage = self.classifier.classify(request.subject, request.description)
        assigned_team, routed_to, requires_review = self.router.route(
            triage.category, triage.urgency, triage.confidence
        )
        now = datetime.now(timezone.utc)
        grievance = Grievance(
            grievance_id=f"GRV-{uuid4().hex[:10].upper()}",
            student_id=request.student_id,
            subject=request.subject,
            description=request.description,
            source=request.source,
            category=triage.category,
            urgency=triage.urgency,
            status=GrievanceStatus.OPEN,
            assigned_team=assigned_team,
            routed_to=routed_to,
            requires_human_review=requires_review,
            suggested_resolution=self.resolver.draft(triage.category),
            created_at=now,
            updated_at=now,
        )
        return self.repository.save(grievance)
