from uuid import uuid4

from app.models.schemas import EscalationResponse


class GrievanceEscalator:
    """Boundary for the grievance service; replace the local ticket with an HTTP call in production."""

    def __init__(self) -> None:
        self.tickets: dict[str, EscalationResponse] = {}

    async def escalate(self, student_id: str, message: str) -> EscalationResponse:
        ticket_id = f"GRV-{uuid4().hex[:10].upper()}"
        ticket = EscalationResponse(
            ticket_id=ticket_id,
            student_id=student_id,
            status="open",
            message="Your query was sent to the grievance team. Keep this ticket ID for follow-up.",
        )
        self.tickets[ticket_id] = ticket
        return ticket
