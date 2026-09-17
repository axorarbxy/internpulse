# InternPulse Full-Stack Runbook

The application is split into one React shell, one core Express gateway, five Module 3 FastAPI services, and the Module 4 realtime/security service.

## Service map

| Service | Port | Directory |
| --- | ---: | --- |
| React shell | 5173 | `module2/frontend` |
| Core API gateway | 5000 | `backend` |
| Module 4 REST + Socket.IO | 5004 | `Module-04/module-04-backend` |
| Recommendation engine | 8001 | `module3/recommendation-engine` |
| Chatbot | 8002 | `module3/chatbot` |
| Grievance system | 8003 | `module3/grievance-system` |
| Feedback analysis | 8004 | `module3/feedback-analysis` |
| Fraud detection | 8005 | `module3/fraud-detection` |

## Required shared configuration

The core backend and Module 4 must use the same `JWT_SECRET`. Module 4 also requires MongoDB through `DATABASE_URL`; the core backend requires PostgreSQL through `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.

Set Module 4 to use the core API as its Module 1 base when its live adapter is implemented:

```powershell
$env:JWT_SECRET = "a-local-development-secret"
$env:MODULE4_API_URL = "http://localhost:5004"
$env:MODULE1_MODE = "mock"
$env:MODULE3_MODE = "mock"
```

The browser calls core APIs through `/api`. Module 4 REST calls use `/api/realtime`, which the core gateway forwards to port 5004. Socket.IO connects directly to `http://localhost:5004` using the same JWT.

## Start order

1. Start PostgreSQL and MongoDB.
2. Start the five Module 3 services on ports `8001` through `8005`.
3. Start Module 4 from `Module-04/module-04-backend` with `npm install` and `npm run dev`.
4. Start the core backend from `backend` with `npm install` and `npm run dev`.
5. Start the React shell from `module2/frontend` with `npm install` and `npm run dev`.

Sign in through the React shell. The JWT is shared by core APIs, Module 4 REST, and the Module 4 Socket.IO handshake. Messages and notifications are available in every role workspace.
