from app.models.schemas import GrievanceCategory


class ResolutionDraftService:
    DRAFTS = {
        GrievanceCategory.CERTIFICATE: "The certificates team should verify completion records and issue or correct the certificate. Please attach any completion evidence if it is missing from your profile.",
        GrievanceCategory.COMPANY_UNRESPONSIVE: "Employer relations should contact the company and confirm the internship status. Keep copies of your messages and any agreed response deadlines.",
        GrievanceCategory.PAYMENT: "The finance team should verify the payment or stipend record and share the expected resolution date with the student.",
        GrievanceCategory.APPLICATION: "The placement team should review the application timeline and confirm the current decision or next action shown in the student's account.",
        GrievanceCategory.PLATFORM: "Platform support should review the account or dashboard issue. Include the time of the error and a screenshot if possible.",
        GrievanceCategory.OTHER: "An institution administrator should review the complaint, identify the responsible team, and contact the student with the next steps.",
    }

    def draft(self, category: GrievanceCategory) -> str:
        return self.DRAFTS[category]
