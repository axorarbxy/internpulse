import os

import httpx


class GrievanceReviewClient:
    """Creates an institution review case without changing fraud decisions."""

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or os.getenv("GRIEVANCE_API_URL", "")).rstrip("/")

    def create_review_case(
        self,
        student_id: str,
        subject: str,
        evidence: list[str],
        source: str = "fraud-detection",
    ) -> str | None:
        if not self.base_url:
            return None
        try:
            response = httpx.post(
                f"{self.base_url}/grievances",
                json={
                    "student_id": student_id,
                    "subject": subject,
                    "description": "\n".join(evidence),
                    "source": source,
                },
                timeout=2.0,
            )
            response.raise_for_status()
            return response.json()["grievance_id"]
        except (httpx.HTTPError, KeyError, TypeError, ValueError):
            return None
