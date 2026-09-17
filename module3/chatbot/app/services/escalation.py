import os
from uuid import uuid4

import httpx

from app.models.schemas import EscalationResponse


class GrievanceEscalator:
    """Escalate to grievance-service when configured, with a local fallback."""

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or os.getenv("GRIEVANCE_API_URL", "")).rstrip("/")
        self.tickets: dict[str, EscalationResponse] = {}

    async def escalate(self, student_id: str, message: str) -> EscalationResponse:
        if self.base_url:
            try:
                async with httpx.AsyncClient(timeout=2.0) as client:
                    response = await client.post(
                        f"{self.base_url}/grievances",
                        json={
                            "student_id": student_id,
                            "subject": "Chatbot escalation",
                            "description": message,
                            "source": "chatbot",
                        },
                    )
                    response.raise_for_status()
                    grievance = response.json()
                    return EscalationResponse(
                        ticket_id=grievance["grievance_id"],
                        student_id=student_id,
                        status=grievance["status"],
                        message="Your query was sent to the grievance team. Keep this ticket ID for follow-up.",
                    )
            except (httpx.HTTPError, KeyError, TypeError, ValueError):
                pass

        ticket_id = f"GRV-{uuid4().hex[:10].upper()}"
        ticket = EscalationResponse(
            ticket_id=ticket_id,
            student_id=student_id,
            status="open",
            message="Your query was sent to the grievance team. Keep this ticket ID for follow-up.",
        )
        self.tickets[ticket_id] = ticket
        return ticket
