# InternPulse Backend Gateway

The Express API owns authentication and the core platform routes. It also exposes the Module 3 services through `/api/intelligence` so the frontend uses one authenticated API boundary.

## Module 3 URLs

Set these variables when the services do not use their local defaults:

```powershell
$env:RECOMMENDATION_API_URL = "http://localhost:8001"
$env:CHATBOT_API_URL = "http://localhost:8002"
$env:GRIEVANCE_API_URL = "http://localhost:8003"
$env:FEEDBACK_API_URL = "http://localhost:8004"
$env:FRAUD_API_URL = "http://localhost:8005"
```

The gateway provides recommendations, skill gaps, chatbot, feedback, grievance, and fraud routes under `/api/intelligence`, plus `/api/intelligence/dashboard/:studentId` for the combined student view. The gateway returns `502` when a downstream module is unavailable instead of hiding a failed request as successful.

## Internal integration contract

Set `INTERNAL_SERVICE_KEY` in the backend environment. Module 4 and the recommendation engine use the same value as `MODULE1_SERVICE_TOKEN` and `CORE_SERVICE_KEY` to access `/api/integration/*` for real student, internship, and participant data.

Start the five FastAPI services on ports `8001` through `8005`, then start this backend with `npm run dev`.
