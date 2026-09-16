from app.models.schemas import GrievanceCategory, Urgency


class GrievanceRouter:
    TEAMS = {
        GrievanceCategory.CERTIFICATE: "certificates_team",
        GrievanceCategory.COMPANY_UNRESPONSIVE: "employer_relations",
        GrievanceCategory.PAYMENT: "finance_team",
        GrievanceCategory.APPLICATION: "placement_team",
        GrievanceCategory.PLATFORM: "platform_support",
        GrievanceCategory.OTHER: "institution_admin",
    }

    def route(self, category: GrievanceCategory, urgency: Urgency, confidence: float) -> tuple[str, str, bool]:
        requires_review = category is GrievanceCategory.OTHER or confidence < 0.5
        team = self.TEAMS[category]
        if requires_review:
            return "institution_admin", "institution_admin", True
        if urgency is Urgency.URGENT:
            return team, f"{team}+institution_admin", False
        return team, team, False
