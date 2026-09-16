import re

from app.models.schemas import GrievanceCategory, Urgency


class TriageResult:
    def __init__(
        self,
        category: GrievanceCategory,
        urgency: Urgency,
        confidence: float,
    ) -> None:
        self.category = category
        self.urgency = urgency
        self.confidence = confidence


class GrievanceClassifier:
    CATEGORY_KEYWORDS: dict[GrievanceCategory, set[str]] = {
        GrievanceCategory.CERTIFICATE: {"certificate", "certification", "document", "issued", "credential"},
        GrievanceCategory.COMPANY_UNRESPONSIVE: {"company", "employer", "unresponsive", "reply", "response", "contact"},
        GrievanceCategory.PAYMENT: {"payment", "stipend", "salary", "reimbursement", "money", "fee"},
        GrievanceCategory.APPLICATION: {"application", "apply", "internship", "selection", "offer", "deadline"},
        GrievanceCategory.PLATFORM: {"login", "password", "dashboard", "error", "website", "account"},
    }
    URGENT_KEYWORDS = {"urgent", "emergency", "immediately", "fraud", "harassment", "threat", "unsafe", "deadline today"}

    def classify(self, subject: str, description: str) -> TriageResult:
        tokens = set(re.findall(r"[a-z0-9]+", f"{subject} {description}".lower()))
        scored = {
            category: len(tokens & keywords)
            for category, keywords in self.CATEGORY_KEYWORDS.items()
        }
        category, score = max(scored.items(), key=lambda item: item[1])
        if score == 0:
            category = GrievanceCategory.OTHER
        urgency = Urgency.URGENT if tokens & self.URGENT_KEYWORDS else Urgency.ROUTINE
        confidence = min(1.0, 0.45 + (0.15 * score)) if score else 0.2
        return TriageResult(category, urgency, round(confidence, 2))
