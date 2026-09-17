from app.data.seed_data import INTERNSHIPS, STUDENTS
from app.models.schemas import Internship, StudentProfile


class InMemoryRepository:
    def __init__(self) -> None:
        self.students = dict(STUDENTS)
        self.internships = list(INTERNSHIPS)

    def get_student(self, student_id: str) -> StudentProfile | None:
        return self.students.get(student_id)

    def list_internships(self) -> list[Internship]:
        return list(self.internships)
