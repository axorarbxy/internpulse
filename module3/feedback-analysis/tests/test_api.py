from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_feedback_returns_sentiment_and_updates_score():
    response = client.post(
        "/feedback",
        json={
            "company_id": "company-good",
            "student_id": "student-1",
            "rating": 5,
            "comment": "Great mentorship and helpful responsive team.",
        },
    )
    assert response.status_code == 201
    assert response.json()["sentiment"] == "positive"
    score = client.get("/companies/company-good/score").json()
    assert score["feedback_count"] == 1
    assert score["quality_score"] > 0.8


def test_negative_feedback_has_themes_and_lower_quality():
    client.post(
        "/feedback",
        json={
            "company_id": "company-poor",
            "student_id": "student-2",
            "rating": 1,
            "comment": "No mentorship and delayed payment. Company was unresponsive.",
        },
    )
    score = client.get("/companies/company-poor/score").json()
    assert score["average_sentiment"] < 0
    assert score["quality_score"] < 0.5
    themes = client.get("/companies/company-poor/themes").json()["themes"]
    assert any(theme["theme"] == "mentorship" for theme in themes)


def test_empty_company_has_neutral_score():
    response = client.get("/companies/unknown/score")
    assert response.status_code == 200
    assert response.json()["quality_score"] == 0.5
