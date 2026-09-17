// INTERNAL MODULE 4 FUNCTIONALITY
const messageService = require('../services/messageService');
const conversationService = require('../services/conversationService');
const { ok, fail } = require('../utils/apiResponse');
const { isNonEmptyString, MAX_MESSAGE_SIZE } = require('../utils/validators');

async function getHistory(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const authorized = await conversationService.isParticipant(conversationId, req.user.id);
    if (!authorized) {
      await messageService.logUnauthorizedAccess(req.user.id, conversationId);
      return fail(res, 403, 'You are not authorized to access this conversation', 'FORBIDDEN');
    }
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const result = await messageService.getMessages(conversationId, { page, limit });
    return ok(res, result);
  } catch (err) { next(err); }
}

async function send(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const { ciphertext, iv } = req.body;

    const authorized = await conversationService.isParticipant(conversationId, req.user.id);
    if (!authorized) {
      await messageService.logUnauthorizedAccess(req.user.id, conversationId);
      return fail(res, 403, 'You are not authorized to send to this conversation', 'FORBIDDEN');
    }
    if (!isNonEmptyString(ciphertext, MAX_MESSAGE_SIZE) || !isNonEmptyString(iv, 200)) {
      return fail(res, 400, 'Invalid message payload', 'VALIDATION_ERROR');
    }

    const message = await messageService.sendMessage({
      conversationId,
      senderId: req.user.id,
      ciphertext,
      iv,
    });
    return ok(res, message, 201);
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    const message = await messageService.markMessageRead(req.params.id, req.user.id);
    if (!message) return fail(res, 404, 'Message not found', 'NOT_FOUND');
    return ok(res, message);
  } catch (err) { next(err); }
}

module.exports = { getHistory, send, markRead };
