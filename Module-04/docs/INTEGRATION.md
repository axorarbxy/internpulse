# Module 4 — Integration Guide

## 1. What Module 4 needs from Module 1 (REQUIRED CONTRACT)

These are internal Module 1 endpoints exposed to Module 4 through the shared
service key (see `backend/routes/integrationRoutes.js` and
`module-04-backend/src/integration/module1Adapter.js`).

| Assumed endpoint | Used for |
|---|---|
| `GET /api/integration/users/:id` → `{ id, name, role }` | Notification recipient lookups |
| `GET /api/integration/applications/:id/certificate-data` → completed application snapshot | Certificate issuance (student, company, internship, dates) |
| `GET /api/integration/internships/:id` → `{ id, title, studentId, companyId, startDate, endDate, status }` | Document verification routing |
| `GET /internships/:id/participants` → `[userId, ...]` | Not yet wired into a route — available in the adapter for Module 1/2 to use |
| `GET /internships/active` → `[internship, ...]` | Weekly reminder job |

Module 4 calls these routes with `X-Internal-Service-Key` and only issues a
certificate when the returned application status is `COMPLETED`.

**JWT contract:** Module 1 must issue JWTs containing at least `userId` and
`role` claims, signed with the same `JWT_SECRET` Module 4 uses to verify.

## 2. What Module 4 exposes to Module 2

- REST API — see `docs/API.md`.
- Socket.IO connection + events — see `docs/SOCKET_EVENTS.md`.
- React components/pages — see `frontend/src/components` and `frontend/src/pages`;
  routing snippet in `frontend/src/routes.example.jsx`.
- Auth requirement: Module 2 must supply the same JWT (from Module 1's login)
  both as `Authorization: Bearer` header for REST and as `auth: { token }` for
  the socket handshake, and store it wherever `frontend/src/services/api.js`
  expects it (`localStorage.authToken` by default — change the key to match
  Module 2's actual auth storage).

## 3. What Module 4 accepts from Module 3

Module 3 calls:

```
POST /api/document-verifications
{
  "documentId": "...",
  "internshipId": "...",
  "status": "FLAGGED",
  "verificationScore": 0.42,
  "reason": "...",
  "verifiedBy": "MODULE_3_AI",
  "timestamp": "..."
}
```

This is normalized by `backend/src/integration/module3Adapter.js` and protected
by the internal service key. Human review resolutions are posted to
`POST /api/document-verifications/resolution` with the same key; the human
reviewer ID is preserved in Module 4's audit record.

## 4. Running Module 4 standalone (before other modules exist)

Set `MODULE1_MODE=mock` and `MODULE3_MODE=mock` (both are the `.env.example`
defaults). Mock data lives in `module1Adapter.js` (`MOCK_USERS`,
`MOCK_INTERNSHIPS`) — clearly marked `(MOCK)` in every seeded name so it's
never confused with real data during a demo.

## 5. Integration checklist

- [x] Module 1 authentication connected (shared `JWT_SECRET`, real login flow)
- [x] Module 1 internship API connected (`MODULE1_MODE=live` in Compose)
- [x] Module 2 notification UI connected (`<NotificationBell />` mounted)
- [x] Module 2 messaging UI connected (`<ChatLayout />` mounted, routes merged)
- [x] Module 3 document verification connected (fraud handoff posts with the internal service key)
- [x] Socket.IO connected (`SocketProvider` wraps the authenticated app)
- [ ] Encryption verified (two real accounts can exchange readable messages, server DB shows only ciphertext)
- [x] Certificate generation verified
- [x] QR verification verified (scanning opens `/#/verify/:certificateId` and returns VALID)
- [x] Security tests passed (`backend` test suite: 18 tests)
