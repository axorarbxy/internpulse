# Module 4 — Security Design

## Authentication
- Module 4 never issues JWTs. It only verifies tokens signed with the shared
  `JWT_SECRET` (owned by Module 1).
- REST: `Authorization: Bearer <token>`, verified in `middleware/auth.js`.
- Socket.IO: token passed in the handshake `auth` payload, verified before any
  connection event fires (`sockets/index.js`).

## Authorization (RBAC + resource-level)
- `middleware/auth.js` validates signed JWTs and rejects unknown roles; legacy
  `INSTITUTE` claims are normalized to `INSTITUTION`.
- Role checks: `middleware/rbac.js` (`requireRole(...)`) gates certificate
  issuance and document-verification reads. Module 3 verification callbacks
  use the shared internal service key, not an end-user account.
- A company can issue a certificate only for its own internship. Certificate
  reads and downloads are limited to the student/company participants or an
  administrator. Document-verification reads are limited to internship
  participants or an administrator.
- Resource-level checks (the important ones): every conversation/message
  action re-verifies `conversationService.isParticipant(conversationId, userId)`
  server-side — over REST and Socket.IO, including typing events — so changing
  a `conversationId` in a request can never expose another pair's conversation.
  Conversation creation verifies the exact student/company pair from the
  internship record, and conversation reuse is scoped to that internship.
  Denials are written to the audit log where applicable.

## End-to-end encryption (messaging)
- Implemented with the **Web Crypto API** in `frontend/src/utils/crypto.js`:
  ECDH (P-256) key agreement per conversation → AES-GCM 256 symmetric key →
  message-level random IV.
- The server (`backend/src/models/Message.js`, `messageService.js`) stores and
  transports only `ciphertext` + `iv`. It has no decryption capability and no
  code path ever attempts to read plaintext.
- This is a genuine E2E scheme, not `btoa()` or hashing — the server
  literally cannot recover message content even if the database is compromised.
- **Known simplification for the prototype:** the ECDH key exchange between
  participants' public keys is not yet wired to a persistent per-user
  keystore (that depends on Module 1's user profile storage). The crypto
  primitives are production-grade; the key-distribution UX needs to be
  finished during integration (see INTEGRATION.md).

## Certificate tamper-proofing
1. Canonical JSON of `{certificateId, internshipId, dataSnapshot}` (deep
   key-sorted so ordering never changes the hash).
2. SHA-256 hash of the canonical form.
3. HMAC-SHA256 signature of the hash using `CERTIFICATE_SIGNING_KEY`
   (swap for RSA/ECDSA asymmetric signing in production — the
   `certificateCrypto.js` interface stays the same).
4. Verification recomputes the hash from stored data and checks the signature
   with `crypto.timingSafeEqual` (constant-time comparison). Any edit to the
   stored snapshot changes the hash and fails verification — this is how
   tampering is detected.
5. The QR code encodes **only** the verification URL, never certificate data.

## Message & input security
- Message size capped (5000 chars ciphertext) at both REST and socket layers.
- `express.json({ limit: '100kb' })` request size cap.
- Rate limiting: 30 messages/min (messaging), 600 req/15min (general) — `middleware/rateLimiter.js`.
- `xss` sanitization utility available for any user-supplied text fields outside the encrypted path (e.g. future profile fields).
- Helmet security headers, CORS restricted to `FRONTEND_URL`/`SOCKET_ORIGIN`.

## Logging & audit
- `utils/logger.js` (winston, structured JSON) — explicitly never logs message
  plaintext, keys, or secrets; only metadata (userId, event type, status).
- `services/auditService.js` records: certificate generation/verification,
  document-verification status changes, and conversation/socket authorization
  denials, with minimal metadata (no plaintext content ever stored).

## Secrets management
- `.env.example` lists every required variable; `.env` is git-ignored.
- No secret is hard-coded anywhere in source.
- Production startup rejects short or known development secrets and requires
  Module 1 live integration for authoritative user/internship checks.

## IDOR protection
- Every "get by ID" endpoint (conversations, messages, certificates, document
  verifications) checks ownership/participation before returning data —
  see the `isOwner` / `isParticipant` checks in the corresponding controllers.
