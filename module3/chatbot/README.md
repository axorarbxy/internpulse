# Student AI Chatbot

Module 3 service for answering student platform FAQs with retrieval-augmented responses and grievance escalation.

## Run

```powershell
cd chatbot
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:LLM_API_KEY = "your_key_here" # optional
uvicorn app.main:app --reload --port 8002
```

Open `http://localhost:8002/docs` for interactive API documentation.

## Endpoints

- `POST /chat` accepts `student_id`, `message`, and an optional `session_id`.
- `GET /chat/history/{student_id}?session_id=...` returns stored conversation messages.
- `POST /chat/escalate` manually creates a grievance ticket.
- `GET /health` provides a basic readiness check.

The service indexes ten FAQ entries with TF-IDF. A confident match returns the FAQ answer; when `LLM_API_KEY` is configured, the retrieved FAQ and recent conversation are sent to the OpenAI-compatible endpoint configured by `LLM_API_URL` and `LLM_MODEL`. If retrieval confidence is below the threshold, the query is escalated automatically.

Session and grievance storage are in memory for this baseline. Replace `InMemorySessionStore` with Redis and `GrievanceEscalator` with the grievance service HTTP client for deployment.
