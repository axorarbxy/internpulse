from app.models.schemas import FAQEntry


FAQS = [
    FAQEntry(
        faq_id="faq-001",
        question="How do I apply for an internship?",
        answer="Open the Internships page, filter by your interests, select a role, and choose Apply. Complete the requested profile and document fields before submitting.",
        keywords=["application", "apply", "internship", "submit"],
    ),
    FAQEntry(
        faq_id="faq-002",
        question="When is the application deadline?",
        answer="Each internship has its own deadline shown on the role details page. Applications must be submitted before 23:59 on the date displayed there.",
        keywords=["deadline", "due date", "closing date", "last date"],
    ),
    FAQEntry(
        faq_id="faq-003",
        question="What are the eligibility requirements?",
        answer="Eligibility varies by internship. Check the role details for year of study, course, location, and required skills before applying.",
        keywords=["eligible", "eligibility", "requirements", "qualify"],
    ),
    FAQEntry(
        faq_id="faq-004",
        question="Which documents do I need to submit?",
        answer="Most applications require an up-to-date profile and resume. Some roles also request a transcript, portfolio, or cover letter; the application form lists the exact documents.",
        keywords=["documents", "resume", "cv", "transcript", "portfolio"],
    ),
    FAQEntry(
        faq_id="faq-005",
        question="How can I update my profile or resume?",
        answer="Go to Profile, choose Edit, update your details or resume, and select Save. Your changes will be available to future applications.",
        keywords=["update", "edit", "profile", "resume", "cv"],
    ),
    FAQEntry(
        faq_id="faq-006",
        question="How do I check my application status?",
        answer="Open Dashboard and select My Applications. Each application shows its current status and any next action requested from you.",
        keywords=["status", "application status", "track", "dashboard"],
    ),
    FAQEntry(
        faq_id="faq-007",
        question="I forgot my password. How can I reset it?",
        answer="Select Forgot password on the sign-in page, enter your registered email, and follow the reset link. Check spam if the email is not in your inbox.",
        keywords=["password", "reset", "forgot", "login", "sign in"],
    ),
    FAQEntry(
        faq_id="faq-008",
        question="How are internship recommendations generated?",
        answer="Recommendations compare your listed skills and resume text with internship requirements. Roles with stronger matches and better feedback are ranked higher.",
        keywords=["recommendations", "matching", "skills", "suggestions", "ranking"],
    ),
    FAQEntry(
        faq_id="faq-009",
        question="How do I contact support or raise a grievance?",
        answer="Use the chatbot to describe the issue. If the FAQ cannot resolve it, the conversation can be escalated to the grievance team for follow-up.",
        keywords=["support", "grievance", "complaint", "issue", "help"],
    ),
    FAQEntry(
        faq_id="faq-010",
        question="Can I withdraw an application?",
        answer="Open My Applications, select the relevant application, and choose Withdraw when that option is available. Withdrawn applications cannot usually be restored.",
        keywords=["withdraw", "cancel", "application", "remove"],
    ),
]
