from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_certificate_grievance_is_triaged_and_routed():
    response = client.post(
        "/grievances",
        json={
            "student_id": "student-1",
            "subject": "Certificate not issued",
            "description": "My internship certificate has not been issued yet.",
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["category"] == "certificate"
    assert payload["urgency"] == "routine"
    assert payload["assigned_team"] == "certificates_team"
    assert payload["suggested_resolution"]


def test_urgent_company_case_routes_to_team_and_admin():
    response = client.post(
        "/grievances",
        json={
            "student_id": "student-2",
            "subject": "Urgent company issue",
            "description": "The company is unresponsive and this is urgent.",
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["category"] == "company_unresponsive"
    assert payload["urgency"] == "urgent"
    assert payload["routed_to"] == "employer_relations+institution_admin"


def test_unknown_case_requires_human_review_and_can_be_resolved():
    response = client.post(
        "/grievances",
        json={
            "student_id": "student-3",
            "subject": "Something unusual",
            "description": "I need help with a matter not covered by the normal categories.",
        },
    )
    grievance_id = response.json()["grievance_id"]
    assert response.json()["requires_human_review"] is True
    update = client.patch(
        f"/grievances/{grievance_id}/status",
        json={"status": "resolved", "resolution_note": "Reviewed by admin."},
    )
    assert update.status_code == 200
    assert update.json()["status"] == "resolved"


def test_student_filter_and_missing_grievance():
    client.post(
        "/grievances",
        json={
            "student_id": "student-list",
            "subject": "Payment missing",
            "description": "My stipend payment is missing.",
        },
    )
    response = client.get("/grievances?studentId=student-list")
    assert response.json()["total"] == 1
    assert client.get("/grievances/not-found").status_code == 404
