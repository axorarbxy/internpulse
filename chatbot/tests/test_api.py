from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_faq_chat_returns_answer_and_persists_history():
    response = client.post(
        "/chat",
        json={"student_id": "student-1", "message": "How do I apply for an internship?"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "faq"
    assert payload["escalated"] is False
    history = client.get(f"/chat/history/student-1?session_id={payload['session_id']}")
    assert len(history.json()["messages"]) == 2


def test_unknown_query_is_escalated():
    response = client.post(
        "/chat",
        json={"student_id": "student-2", "message": "Can you resolve my scholarship payment dispute?"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["escalated"] is True
    assert payload["source"] == "grievance"
    assert payload["ticket_id"].startswith("GRV-")


def test_manual_escalation_creates_ticket():
    response = client.post(
        "/chat/escalate",
        json={"student_id": "student-3", "message": "I need human support."},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "open"
