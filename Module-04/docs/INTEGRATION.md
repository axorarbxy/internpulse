# Module 4 — Integration Guide

## 1. What Module 4 needs from Module 1 (REQUIRED CONTRACT)

These are **assumed** endpoint shapes, documented as a contract — they must be
mapped to Module 1's actual API during integration (see `backend/src/integration/module1Adapter.js`).

| Assumed endpoint | Used for |
|---|---|
| `GET /users/:id` → `{ id, name, role }` | Certificate data snapshot, notification recipient lookups |
| `GET /internships/:id` → `{ id, title, studentId, companyId, startDate, endDate, status }` | Certificate issuance, document verification routing |
| `GET /internships/:id/participants` → `[userId, ...]` | Not yet wired into a route — available in the adapter for Module 1/2 to use |
| `GET /internships/active` → `[internship, ...]` | Weekly reminder job |

**To integrate:** implement the "LIVE MODE" branches in `module1Adapter.js` with
real `fetch`/HTTP calls to Module 1's actual routes, set `MODULE1_MODE=live`
and `MODULE1_BASE_URL` in `.env`. No other file needs to change — every
service calls the adapter, never Module 1 directly.

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

This is normalized by `backend/src/integration/module3Adapter.js`. Until
Module 3's real service identity/auth is decided, the route is protected with
`requireRole('ADMIN', 'INSTITUTE')` as a placeholder — replace with a
service-to-service auth scheme (e.g. an internal API key or a dedicated
`SERVICE` role) once that's defined.

## 4. Running Module 4 standalone (before other modules exist)

Set `MODULE1_MODE=mock` and `MODULE3_MODE=mock` (both are the `.env.example`
defaults). Mock data lives in `module1Adapter.js` (`MOCK_USERS`,
`MOCK_INTERNSHIPS`) — clearly marked `(MOCK)` in every seeded name so it's
never confused with real data during a demo.

## 5. Integration checklist

- [ ] Module 1 authentication connected (shared `JWT_SECRET`, real login flow)
- [ ] Module 1 internship API connected (`MODULE1_MODE=live`)
- [ ] Module 2 notification UI connected (`<NotificationBell />` mounted)
- [ ] Module 2 messaging UI connected (`<ChatLayout />` mounted, routes merged)
- [ ] Module 3 document verification connected (real POST to `/api/document-verifications`)
- [ ] Socket.IO connected (`SocketProvider` wraps the authenticated app)
- [ ] Encryption verified (two real accounts can exchange readable messages, server DB shows only ciphertext)
- [ ] Certificate generation verified
- [ ] QR verification verified (scanning resolves to `/verify/:certificateId` and returns VALID)
- [ ] Security tests passed (`backend` test suite)
