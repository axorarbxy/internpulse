# Module 4 — Real-Time Systems, Communication & Security

Part of the **Smart Internship Management & Verification Platform**.
This module is independently developed and testable, and integration-ready
for Modules 1–3 (see `docs/INTEGRATION.md`).

## Features
1. Real-time notifications (Socket.IO + persisted history, unread counts)
2. Private student ↔ company messaging with genuine client-side E2E encryption (Web Crypto API, AES-GCM)
3. Weekly progress reminders (BullMQ/Redis, with a node-cron fallback for local dev)
4. Document verification support layer (receives/stores Module 3's results, notifies, audits)
5. Tamper-proof certificate generation (SHA-256 hash + HMAC signature + QR code)
6. Public certificate verification endpoint/page
7. Role-based access control, IDOR protection, audit logging

## Architecture
```
React frontend (components/pages) → REST + Socket.IO → Express/Socket.IO backend
   → services → MongoDB (module4_* collections)
   → integration/module1Adapter.js, integration/module3Adapter.js
```
Full diagrams and rationale: see the architecture analysis delivered alongside this build.

## Technology stack
- Frontend: React, Vite, Tailwind CSS, Socket.IO client, Web Crypto API
- Backend: Node.js, Express, Socket.IO, JWT, Node crypto, Mongoose (MongoDB)
- Jobs: BullMQ/Redis (preferred) with node-cron fallback
- PDF/QR: pdfkit, qrcode

## Folder structure
```
module-4/
├── backend/
│   └── src/{config,middleware,models,services,controllers,routes,sockets,jobs,integration,utils,__tests__}
├── frontend/
│   └── src/{components,pages,services,hooks,context,utils}
├── docs/{API.md,SOCKET_EVENTS.md,INTEGRATION.md,SECURITY.md,DATABASE.md}
└── README.md
```

## Installation

### Backend
```bash
cd backend
cp .env.example .env    # fill in JWT_SECRET (shared with Module 1), CERTIFICATE_SIGNING_KEY
npm install
npm run dev              # nodemon, requires MongoDB running locally or DATABASE_URL set
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # Vite dev server, default http://localhost:5173
```

### Database
Any MongoDB instance works for the prototype:
```bash
# local
mongod --dbpath ./data
# or use a free Atlas cluster and set DATABASE_URL accordingly
```

### Redis (optional)
If `REDIS_URL` is set, the reminder job runs via BullMQ (production-friendly).
If unset, it automatically falls back to `node-cron` — nothing else to configure.

## Environment variables
See `backend/.env.example` and `frontend/.env.example`. Never commit `.env`.

## Testing
```bash
cd backend
npm test
```
Covers: certificate hash/signature integrity & tamper detection, Module 3
payload validation, JWT verification (valid/invalid/expired/missing-claims),
and conversation authorization (IDOR prevention).

## Demo steps (matches docs' demo scenarios)
1. Start backend + frontend + MongoDB.
2. Log in as two mock users (or use the seeded mock IDs `student-1` / `company-1`
   with a hand-signed JWT for local testing, since Module 1's real login isn't present yet).
3. Open `/messages` as both users in separate browsers → send a message → verify
   it appears instantly and the DB only ever contains ciphertext.
4. Trigger a notification (e.g. call `notificationService.createNotification`
   from a script) → confirm it arrives live and appears in `/notifications`.
5. `POST /api/certificates` for `internship-1` → download the PDF → scan the QR
   → confirm `/verify/:certificateId` returns `VALID`.
6. Manually edit a certificate's `dataSnapshot` in the DB → re-verify → confirm it now returns `TAMPERED`.

## Encryption explanation
- **Where encryption happens:** client, in `frontend/src/utils/crypto.js`, before the message ever leaves the browser.
- **Where decryption happens:** the recipient's client, using the shared AES-GCM key derived via ECDH.
- **What the server stores:** `ciphertext` + `iv` only (`backend/src/models/Message.js`) — never plaintext, never the encryption key.
- **Keys used:** ECDH P-256 key pairs per user → derived AES-GCM 256 session key per conversation, cached in memory client-side only.
This satisfies genuine end-to-end encryption: the server cannot read message content even with full database access. See `docs/SECURITY.md` for the one noted prototype simplification (persistent key distribution, to be finished during Module 1 integration).

## Certificate security explanation
Canonical JSON → SHA-256 hash → HMAC-SHA256 signature (Node crypto) → unique
`CERT-XXXXXX` ID → QR encoding only the verification URL → public endpoint
recomputes the hash and checks the signature with a timing-safe comparison.
Any change to the stored data changes the hash, so tampering is detected
deterministically. Full detail in `docs/SECURITY.md`.

## Integration with Modules 1–3
See `docs/INTEGRATION.md` for the full contract, adapters, and checklist.

## Known assumptions
- Module 1's exact user/internship endpoint shapes are assumed and mocked (`MODULE1_MODE=mock`); swap to `live` once real endpoints exist.
- Module 3's caller identity/auth scheme is a placeholder (`ADMIN`/`INSTITUTE` role) pending a real service-to-service auth decision.
- Database shown as MongoDB/Mongoose; maps directly to relational tables if the team's shared DB is SQL (see `docs/DATABASE.md`).

## Future improvements
- Persistent per-user key storage for messaging (IndexedDB, non-extractable keys) once Module 1 exposes public-key storage on user profiles.
- Certificate revocation UI/endpoint (schema already supports `status: REVOKED`).
- RSA/ECDSA asymmetric certificate signing instead of HMAC, once a keypair distribution strategy is agreed with the team.
