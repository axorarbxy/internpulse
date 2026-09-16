# Fraud & Content-Authenticity Detection

Module 3 service that surfaces possible content-authenticity and participation anomalies for institution review. It is advisory only: this service has no auto-rejection path.

## Run

```powershell
cd fraud-detection
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8005
```

Open `http://localhost:8005/docs` for interactive API documentation.

## Endpoints

- `POST /analyze/content` runs stylometric and metadata heuristics on submitted work.
- `POST /analyze/activity/{internship_id}` runs an Isolation Forest baseline plus deadline-burst detection on activity events.
- `POST /handoffs/document` accepts suspicious-document findings from Module 4.
- `GET /flags?status=pending` lists flags awaiting institution review.
- `PATCH /flags/{id}/resolve` marks a flag reviewed/resolved.
- `GET /health` reports `policy: advisory_only`.

## Review policy

Scores are signals, not authorship or fraud determinations. A score of `0.4` or higher creates a pending flag with evidence and an explicit human-review advisory. No endpoint rejects, blocks, penalizes, or changes a student's submission status.

## Integration points

Replace the in-memory flag store with the Module 1 database adapter, feed Module 1 activity events into the activity endpoint, and send Module 4 verification mismatches to `/handoffs/document`. The activity analyzer's feature baseline can also be replaced with the Cybereye behavior-baselining pipeline while retaining the same advisory flag contract.
