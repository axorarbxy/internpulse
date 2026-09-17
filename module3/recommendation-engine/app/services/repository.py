import json
import os
from urllib.request import Request, urlopen

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


class CoreApiRepository:
    def __init__(self, base_url: str, service_key: str) -> None:
        self.base_url = base_url.rstrip('/')
        self.service_key = service_key

    def get_student(self, student_id: str) -> StudentProfile | None:
        try:
            payload = self._request(f'/api/integration/students/{student_id}')
        except LookupError:
            return None
        return StudentProfile.model_validate(payload)

    def list_internships(self) -> list[Internship]:
        payload = self._request('/api/integration/internships')
        return [Internship.model_validate(item) for item in payload.get('internships', [])]

    def _request(self, path: str) -> dict:
        request = Request(
            f'{self.base_url}{path}',
            headers={
                'Accept': 'application/json',
                'X-Internal-Service-Key': self.service_key,
            },
        )
        try:
            with urlopen(request, timeout=5) as response:
                payload = json.loads(response.read().decode('utf-8'))
        except Exception as error:
            if getattr(error, 'code', None) == 404:
                raise LookupError(path) from error
            raise RuntimeError(f'Core integration request failed: {path}') from error
        return payload


def create_repository() -> InMemoryRepository | CoreApiRepository:
    base_url = os.getenv('CORE_API_URL', '').strip()
    if not base_url:
        return InMemoryRepository()
    return CoreApiRepository(base_url, os.getenv('CORE_SERVICE_KEY', ''))
