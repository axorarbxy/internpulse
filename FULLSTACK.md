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
$env:INTERNAL_SERVICE_KEY = "a-local-internal-service-key"
$env:MODULE4_API_URL = "http://localhost:5004"
$env:MODULE1_MODE = "live"
$env:MODULE1_BASE_URL = "http://localhost:5000"
$env:MODULE1_SERVICE_TOKEN = $env:INTERNAL_SERVICE_KEY
$env:MODULE3_MODE = "mock"
$env:CORE_API_URL = "http://localhost:5000"
$env:CORE_SERVICE_KEY = $env:INTERNAL_SERVICE_KEY
```

The browser calls core APIs through `/api`. Module 4 REST calls use `/api/realtime`, which the core gateway forwards to port 5004. Socket.IO connects directly to `http://localhost:5004` using the same JWT.

## Start order

1. Start PostgreSQL and MongoDB.
2. Start the five Module 3 services on ports `8001` through `8005`.
3. Start Module 4 from `Module-04/module-04-backend` with `npm install` and `npm run dev`.
4. Start the core backend from `backend` with `npm install` and `npm run dev`.
5. Start the React shell from `module2/frontend` with `npm install` and `npm run dev`.

Sign in through the React shell. The JWT is shared by core APIs, Module 4 REST, and the Module 4 Socket.IO handshake. Messages and notifications are available in every role workspace.

## Workspace Isolation

- The core API reloads the account role from PostgreSQL on every authenticated request; a client URL or local-storage role cannot grant another workspace.
- Public registration creates student accounts immediately. Company and institution accounts create profiles and remain blocked by RBAC until an administrator approves their organization registration request in the Admin Review Center.
- Student profile, application, certificate, and intelligence APIs are scoped to the authenticated student. Company internship and applicant APIs are scoped to the authenticated company. Draft and archived internships are not returned by general listing endpoints.
- Messages require the authenticated user to be one of the internship's student/company participants. Module 3 document callbacks use the internal service key.
- Student-to-institution membership is stored in `student_institution_memberships`; apply `database/03-institution-membership.sql` before deploying the roster API. Only an `ADMIN` can assign/unassign a student with `PUT /api/institutions/students/:studentUserId/institution`; an `INSTITUTION` can read only its own `/api/institutions/students` roster. Existing students remain unassigned until an administrator assigns them.
- Institution Monitoring, Dashboard, and Analytics use the institution-scoped roster and application/progress records. Missing progress or evaluation data is shown as zero/empty rather than fabricated sample values.
- When `NODE_ENV=production`, the core requires `JWT_SECRET` and `INTERNAL_SERVICE_KEY` to be at least 32 characters and not development placeholders. Module 4 also requires a strong `CERTIFICATE_SIGNING_KEY`, a strong `MODULE1_SERVICE_TOKEN`, and `MODULE1_MODE=live`.
