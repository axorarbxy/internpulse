from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_content_analysis_creates_advisory_flag():
    content = " ".join(["Moreover this report provides a comprehensive overview of the subject."] * 8)
    response = client.post(
        "/analyze/content",
        json={
            "student_id": "student-content",
            "submission_id": "report-1",
            "content": content,
            "metadata": {"generated_by": "unknown-tool"},
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["authenticity_score"] > 0.4
    assert payload["flag_id"]
    assert "not an authorship determination" in client.get("/flags").json()["flags"][0]["advisory"]


def test_burst_activity_near_deadline_creates_flag():
    start = datetime.now(timezone.utc) - timedelta(hours=1)
    events = [
        {
            "timestamp": (start + timedelta(minutes=index * 15)).isoformat(),
            "event_type": "progress",
            "progress_percent": 10 + index * 30,
            "duration_minutes": 10,
        }
        for index in range(4)
    ]
    response = client.post(
        "/analyze/activity/intern-1",
        json={
            "student_id": "student-activity",
            "events": events,
            "deadline": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat(),
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["flag_id"]
    assert any("burst" in item for item in payload["anomalies"])


def test_document_handoff_and_flag_resolution():
    response = client.post(
        "/handoffs/document",
        json={
            "student_id": "student-doc",
            "document_id": "doc-1",
            "reason": "Verification mismatch in issuer metadata",
            "verification_score": 0.9,
        },
    )
    flag_id = response.json()["flag_id"]
    resolved = client.patch(f"/flags/{flag_id}/resolve", json={"resolution_note": "Reviewed"})
    assert resolved.status_code == 200
    assert resolved.json()["status"] == "resolved"
    assert client.get("/flags?status=pending").status_code == 200
