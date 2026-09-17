# Module 4 — Socket.IO Event Documentation

Connect with: `io(SOCKET_URL, { auth: { token: JWT } })`
Server verifies the JWT on handshake; unauthenticated sockets are rejected
before any event handler runs.

Rooms:
- `user:{userId}` — joined automatically on connect; used for personal notifications.
- `conversation:{conversationId}` — joined explicitly via `join_conversation`, only after a server-side participant check.

---

## Client → Server

### join_conversation
- Payload: `{ conversationId }`
- Auth: required (handshake)
- Authorization: server verifies the caller is a participant; emits an audit event on denial.
- Callback: `{ success: true }` or `{ success: false, message, errorCode: 'FORBIDDEN' }`

### leave_conversation
- Payload: `{ conversationId }` — no response.

### send_message
- Payload: `{ conversationId, ciphertext, iv }` (ciphertext ≤ 5000 chars)
- Authorization: participant check, same as REST.
- Server action: persists message, emits `message:new` to the conversation room and `message:delivered` to other participants.
- Callback: `{ success: true, id }` or `{ success: false, message, errorCode }`

### typing_start / typing_stop
- Payload: `{ conversationId }` — broadcasts `user:typing` to the room (not to self).

### mark_notification_read
- Payload: `{ notificationId }`
- Callback: `{ success: boolean }`

---

## Server → Client

### notification:new
`{ id, type, title, message, relatedEntityType, relatedEntityId, isRead, createdAt }`
Sent to `user:{recipientId}` whenever any module (via `notificationService.createNotification`) fires a notification.

### notification:updated
`{ id, isRead }` or `{ all: true, isRead: true }`

### message:new
`{ id, conversationId, senderId, ciphertext, iv, createdAt }` — recipients decrypt client-side.

### message:delivered
`{ id }` — sent to the other participant(s), not the sender.

### message:read
Reserved for read-receipt broadcast (mirrors PATCH /messages/:id/read) — emit from that controller if Module 2 needs live read receipts.

### user:typing
`{ userId, conversationId, typing: boolean }`

### certificate:generated
`{ certificateId, internshipId, studentId }` — emit alongside the `CERTIFICATE_GENERATED` notification if Module 2 wants a dedicated live event.

### document:verified
`{ documentId, verificationStatus }` — emit alongside `DOCUMENT_VERIFICATION_RESULT` notification if needed.

---

## Reconnection

The frontend client (`socket.io-client`, see `frontend/src/services/socket.js`) is configured with
`reconnection: true, reconnectionAttempts: Infinity`. On reconnect, `useConversation`
re-runs `join_conversation` and re-fetches message history via REST to reconcile
anything missed while disconnected — Socket.IO does not replay missed events itself.
