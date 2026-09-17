# Module 4 — REST API Documentation

Base URL: `/api` (backend default port `5004`)

All endpoints except the certificate verification endpoint require:
`Authorization: Bearer <JWT issued by Module 1>`

Response envelope:
- Success: `{ "success": true, "data": {...} }`
- Failure: `{ "success": false, "message": "...", "errorCode": "..." }`

---

## Notifications

### GET /api/notifications
Query: `page` (default 1), `limit` (default 20, max 100)
Returns paginated notifications for the authenticated user, newest first.

### GET /api/notifications/unread-count
Returns `{ count: number }`.

### PATCH /api/notifications/:id/read
Marks one notification as read. 404 if not found or not owned by the user.

### PATCH /api/notifications/read-all
Marks all of the user's notifications as read.

---

## Conversations & Messages

### POST /api/conversations
Body: `{ participantIds: string[], internshipId?: string }`
Caller must be included in `participantIds`. Reuses an existing conversation
between the same participants if one exists.

### GET /api/conversations
Lists conversations the authenticated user participates in.

### GET /api/conversations/:id/messages
Query: `page`, `limit` (max 200). 403 `FORBIDDEN` if the user is not a participant.
Returns `ciphertext` + `iv` only — decrypt client-side.

### POST /api/conversations/:id/messages
Body: `{ ciphertext: string, iv: string }` (both already encrypted client-side).
Rate limited to 30/minute per client. 403 if not a participant.

### PATCH /api/messages/:id/read
Marks a message as read by the authenticated user.

---

## Certificates

### POST /api/certificates
Roles: `COMPANY`, `ADMIN`
Body: `{ internshipId: string }`
Fetches authoritative data from Module 1, generates hash + signature + QR,
persists the certificate, notifies the student.

### GET /api/certificates/:id
Roles: student/company on the certificate, `ADMIN`, `INSTITUTE`.

### GET /api/certificates/:id/download
Streams a generated PDF (professional layout + embedded QR code).

### GET /api/certificates/verify/:certificateId
**Public — no authentication.** Recomputes the hash, checks the signature,
checks revocation status. Returns only non-sensitive fields (see SECURITY.md).

---

## Document Verifications

### POST /api/document-verifications
Roles: `ADMIN`, `INSTITUTE` (intended real caller: Module 3's service identity)
Body: `{ documentId, internshipId?, status, verificationScore?, reason?, verifiedBy? }`
`status` must be one of `PENDING | UNDER_REVIEW | VERIFIED | REJECTED | FLAGGED`.

### GET /api/document-verifications/:documentId
Returns the stored verification record for a document.

---

## Errors

| Status | errorCode | Meaning |
|---|---|---|
| 400 | VALIDATION_ERROR | Malformed/missing input |
| 401 | UNAUTHENTICATED / INVALID_TOKEN | Missing or bad JWT |
| 403 | FORBIDDEN | Authenticated but not authorized |
| 404 | NOT_FOUND | Resource doesn't exist / not owned |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Unexpected server error (no stack trace exposed) |
