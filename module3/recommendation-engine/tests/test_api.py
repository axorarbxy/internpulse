from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_recommendations_are_ranked_and_feedback_is_exposed():
    response = client.get("/recommendations/student-1")
    assert response.status_code == 200
    payload = response.json()
    assert payload["student_id"] == "student-1"
    assert payload["recommendations"][0]["internship_id"] == "intern-101"
    assert payload["recommendations"][0]["feedback_score"] == 0.92
    assert payload["recommendations"][0]["missing_skills"] == ["docker"]


def test_skill_gaps_are_scoped_to_target_domain():
    response = client.get("/skill-gaps/student-1")
    assert response.status_code == 200
    payload = response.json()
    assert payload["target_domain"] == "software engineering"
    assert [gap["skill"] for gap in payload["gaps"]] == ["docker"]


def test_reindex_returns_index_metadata():
    response = client.post("/reindex")
    assert response.status_code == 200
    assert response.json()["indexed_internships"] == 3
    assert response.json()["vocabulary_size"] > 0


def test_unknown_student_returns_not_found():
    response = client.get("/recommendations/unknown")
    assert response.status_code == 404
