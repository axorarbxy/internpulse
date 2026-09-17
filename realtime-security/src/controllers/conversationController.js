// INTERNAL MODULE 4 FUNCTIONALITY
const conversationService = require('../services/conversationService');
const { ok, fail } = require('../utils/apiResponse');
const { isNonEmptyString } = require('../utils/validators');

async function create(req, res, next) {
  try {
    const { participantIds, internshipId } = req.body;
    if (!Array.isArray(participantIds) || participantIds.length < 2) {
      return fail(res, 400, 'participantIds must include at least 2 users', 'VALIDATION_ERROR');
    }
    if (!participantIds.includes(req.user.id)) {
      return fail(res, 403, 'You must be a participant of the conversation you create', 'FORBIDDEN');
    }
    const conversation = await conversationService.createConversation(participantIds, internshipId);
    return ok(res, conversation, 201);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const conversations = await conversationService.getConversationsForUser(req.user.id);
    return ok(res, conversations);
  } catch (err) { next(err); }
}

module.exports = { create, list };
