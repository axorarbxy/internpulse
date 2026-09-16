# Company-Wise Feedback Analysis

Module 3 service for sentiment analysis, theme extraction, and recommendation-ready company quality scores.

## Run

```powershell
cd feedback-analysis
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8004
```

Open `http://localhost:8004/docs` for interactive API documentation.

## Endpoints

- `POST /feedback` stores feedback and returns its sentiment score and label.
- `GET /companies/{id}/score` returns rating, sentiment, count, and `quality_score` in the range `0.0–1.0`.
- `GET /companies/{id}/themes` returns frequently mentioned terms and phrases.
- `GET /health` provides a basic readiness check.

## Scoring

The baseline quality score is:

`0.7 * (average_rating / 5) + 0.3 * ((average_sentiment + 1) / 2)`

Companies without feedback receive a neutral `0.5` score. Sentiment uses a transparent lexicon baseline; the service classes can be replaced with a pretrained model later.

## Recommendation integration

Start this service and set the recommendation engine's URL before starting it:

```powershell
$env:FEEDBACK_API_URL = "http://localhost:8004"
```

The recommendation engine then calls `/companies/{company}/score` and uses the returned `quality_score` as the feedback weight. If the variable is absent or the service is unavailable, seeded/local internship scores remain in use.

The current repository is in memory for local development. Replace `InMemoryFeedbackRepository` with the Module 1 database adapter for persistence across restarts.
