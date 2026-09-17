# AI-Assisted Grievance & Reclamation System

Module 3 service for triaging student complaints, drafting suggested resolutions, routing cases, and tracking status.

## Run

```powershell
cd grievance-system
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003
```

Open `http://localhost:8003/docs` for interactive API documentation.

## Endpoints

- `POST /grievances` submits a complaint and returns its category, urgency, suggested resolution, and routing.
- `GET /grievances/{id}` returns the full grievance record.
- `GET /grievances?studentId=...` lists grievances for one student.
- `PATCH /grievances/{id}/status` changes status to `open`, `in_review`, or `resolved`.
- `GET /health` provides a basic readiness check.

## Triage and routing

The baseline classifier uses transparent keyword rules for certificate, company responsiveness, payment, application, platform, and other complaints. Urgent terms such as `urgent`, `fraud`, `harassment`, and `unsafe` trigger urgent handling. Unknown or low-confidence cases are routed to `institution_admin`; urgent known cases are routed to the responsible team plus institution administration.

Every common category receives a suggested resolution draft for administrator review. The classifier and resolver are isolated behind service classes so an LLM-backed implementation can be added without changing the API contract.

## Module integration

The chatbot can submit an escalated conversation as:

```json
{
  "student_id": "student-42",
  "subject": "Chatbot escalation",
  "description": "Full conversation transcript...",
  "source": "chatbot"
}
```

The current repository is in memory for local development. Replace `InMemoryGrievanceRepository` with the Module 1 database adapter for persistence across restarts.
