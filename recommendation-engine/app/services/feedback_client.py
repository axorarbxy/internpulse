import os

import httpx


class FeedbackScoreClient:
    """Reads recommendation-ready quality scores from feedback-analysis."""

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or os.getenv("FEEDBACK_API_URL", "")).rstrip("/")

    def get_quality_score(self, company_id: str) -> float | None:
        if not self.base_url:
            return None
        try:
            response = httpx.get(
                f"{self.base_url}/companies/{company_id}/score",
                timeout=2.0,
            )
            response.raise_for_status()
            score = float(response.json()["quality_score"])
            return max(0.0, min(1.0, score))
        except (httpx.HTTPError, KeyError, TypeError, ValueError):
            return None
