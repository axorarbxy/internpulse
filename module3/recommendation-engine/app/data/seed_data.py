from app.models.schemas import Internship, StudentProfile


STUDENTS = {
    "student-1": StudentProfile(
        student_id="student-1",
        skills=["Python", "SQL", "FastAPI", "Git"],
        resume_text="Built REST APIs and data pipelines with Python.",
        target_domain="software engineering",
    ),
    "student-2": StudentProfile(
        student_id="student-2",
        skills=["Python", "Pandas", "Statistics", "SQL"],
        target_domain="data science",
    ),
}


INTERNSHIPS = [
    Internship(
        internship_id="intern-101",
        company="Northstar Labs",
        title="Backend Engineering Intern",
        domain="software engineering",
        required_skills=["Python", "FastAPI", "SQL", "Docker", "Git"],
        feedback_score=0.92,
        feedback_count=18,
        description="Build APIs and services for developer tools.",
    ),
    Internship(
        internship_id="intern-102",
        company="Metric Grove",
        title="Data Science Intern",
        domain="data science",
        required_skills=["Python", "Pandas", "SQL", "Statistics", "Machine Learning"],
        feedback_score=0.88,
        feedback_count=25,
        description="Explore product data and create predictive models.",
    ),
    Internship(
        internship_id="intern-103",
        company="Cinder Analytics",
        title="Data Engineering Intern",
        domain="data engineering",
        required_skills=["Python", "SQL", "Spark", "Docker", "AWS"],
        feedback_score=0.48,
        feedback_count=11,
        description="Maintain reliable data pipelines at scale.",
    ),
]
