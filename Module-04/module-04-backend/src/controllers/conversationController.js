// INTERNAL MODULE 4 FUNCTIONALITY
const conversationService = require('../services/conversationService');
const module1Adapter = require('../integration/module1Adapter');
const { ok, fail } = require('../utils/apiResponse');
const { isNonEmptyString } = require('../utils/validators');

async function keys(req, res, next) {
  try {
    const result = await conversationService.getPublicKeys(req.params.id, req.user.id);
    if (!result) return fail(res, 403, 'Not authorized for this conversation', 'FORBIDDEN');
    return ok(res, result);
  } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const { participantIds, internshipId } = req.body;
    if (!Array.isArray(participantIds) || participantIds.length !== 2) {
      return fail(res, 400, 'A conversation must include two portal users', 'VALIDATION_ERROR');
    }
    const uniqueParticipants = [...new Set(participantIds.map(String))];
    if (uniqueParticipants.length !== 2 || !uniqueParticipants.includes(String(req.user.id))) {
      return fail(res, 403, 'You must be one of the conversation participants', 'FORBIDDEN');
    }
    const users = await Promise.all(uniqueParticipants.map((id) => module1Adapter.getUser(id)));
    if (users.some((user) => !['STUDENT', 'COMPANY', 'INSTITUTION', 'ADMIN'].includes(user.role))) {
      return fail(res, 404, 'One or more portal users were not found', 'NOT_FOUND');
    }
    if (internshipId !== undefined && internshipId !== null && !isNonEmptyString(String(internshipId), 100)) {
      return fail(res, 400, 'Invalid internship reference', 'VALIDATION_ERROR');
    }
    let expectedParticipants = uniqueParticipants;
    if (internshipId) {
      const internship = await module1Adapter.getInternship(String(internshipId));
      if (!internship || !internship.studentId || !internship.companyId) {
        return fail(res, 404, 'Internship participants not found', 'NOT_FOUND');
      }
      expectedParticipants = [String(internship.studentId), String(internship.companyId)].sort();
    }
    const requestedParticipants = [...new Set(uniqueParticipants)].sort();
    if (requestedParticipants.length !== 2 || requestedParticipants.some((id, index) => id !== expectedParticipants[index])) {
      return fail(res, 403, 'Conversation participants do not match the internship', 'FORBIDDEN');
    }
    const conversation = await conversationService.createConversation(expectedParticipants, internshipId ? String(internshipId) : undefined);
    return ok(res, conversation, 201);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const conversations = await conversationService.getConversationsForUser(req.user.id);
    const enriched = await Promise.all(conversations.map(async (conversation) => ({
      ...conversation.toObject(),
      participants: await Promise.all(conversation.participantIds.map((id) => module1Adapter.getUser(id))),
    })));
    return ok(res, enriched);
  } catch (err) { next(err); }
}

async function contacts(req, res, next) {
  try {
    const users = await module1Adapter.getUsers();
    return ok(res, users.filter((user) => String(user.id) !== String(req.user.id)));
  } catch (err) { return next(err); }
}

module.exports = { create, list, contacts, keys };
