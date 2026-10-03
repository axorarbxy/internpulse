import logging
import os

import httpx

logger = logging.getLogger(__name__)


class DocumentVerificationClient:
    def __init__(self) -> None:
        self.base_url = os.getenv("MODULE4_API_URL", "").rstrip("/")
        self.service_key = os.getenv("CORE_SERVICE_KEY", "")

    def publish_flag(
        self,
        document_id: str,
        internship_id: str | None,
        score: float,
        reason: str,
        flag_id: str | None = None,
        student_id: str | None = None,
        flag_type: str | None = None,
    ) -> bool:
        if not self.base_url:
            return False

        payload = {
            "documentId": document_id,
            "internshipId": internship_id,
            "flagId": flag_id,
            "studentId": student_id,
            "flagType": flag_type,
            "status": "FLAGGED",
            "verificationScore": score,
            "reason": reason,
            "verifiedBy": "MODULE_3_AI",
        }

        for attempt in range(3):
            try:
                response = httpx.post(
                    f"{self.base_url}/api/document-verifications",
                    json=payload,
                    headers={"X-Internal-Service-Key": self.service_key} if self.service_key else {},
                    timeout=2.0,
                )
                response.raise_for_status()
                return True
            except httpx.HTTPError as exc:
                logger.warning("Failed to publish fraud flag to Module 4 (attempt %s/%s): %s", attempt + 1, 3, exc)
                if attempt == 2:
                    logger.exception("Final failure while publishing fraud flag to Module 4")
                    return False

        return False

    def publish_resolution(
        self,
        flag_id: str,
        outcome: str,
        reason: str | None = None,
        reviewed_by: str | None = None,
    ) -> bool:
        if not self.base_url:
            return False

        payload = {
            "flagId": flag_id,
            "status": "VERIFIED" if outcome == "cleared" else "REJECTED",
            "reason": reason,
            "verifiedBy": reviewed_by or "INSTITUTION_REVIEWER",
        }

        try:
            response = httpx.post(
                f"{self.base_url}/api/document-verifications/resolution",
                json=payload,
                headers={"X-Internal-Service-Key": self.service_key} if self.service_key else {},
                timeout=2.0,
            )
            response.raise_for_status()
            return True
        except httpx.HTTPError as exc:
            logger.warning("Failed to sync fraud resolution back to Module 4: %s", exc)
            return False