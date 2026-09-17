# Skill Analysis & Internship Recommendation Engine

Module 3 service for matching student skills to internship requirements.

## Run

```powershell
cd recommendation-engine
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

To consume live company quality scores from the feedback-analysis service, set `FEEDBACK_API_URL` before starting:

```powershell
$env:FEEDBACK_API_URL = "http://localhost:8004"
```

Open `http://localhost:8001/docs` for the interactive API documentation.

## Endpoints

- `GET /recommendations/{student_id}?limit=10` ranks internships using TF-IDF cosine similarity, then applies a feedback-aware score.
- `GET /skill-gaps/{student_id}` lists missing skills for the student's target domain.
- `POST /reindex` rebuilds the in-memory internship index.
- `GET /health` provides a basic readiness check.

The seed repository in `app/data/seed_data.py` is intentionally replaceable. Integrate Module 1 and the feedback-analysis service by implementing the repository boundary and retaining the `StudentProfile` and `Internship` contracts.

When `FEEDBACK_API_URL` is configured, recommendations call `/companies/{company}/score` and use its `quality_score` for feedback weighting. If the service is unavailable, the engine keeps the local internship score.

## Scoring

`final_score = 0.8 * cosine_similarity + 0.2 * feedback_score * cosine_similarity`

The low feedback score therefore reduces a company's rank without making an otherwise relevant internship disappear.
