// INTERNAL MODULE 4 FUNCTIONALITY
const Conversation = require('../models/Conversation');
const UserKey = require('../models/UserKey');

async function createConversation(participantIds, internshipId) {
  const requestedParticipantIds = [...new Set(participantIds.map(String))];
  const canonicalParticipantIds = [...requestedParticipantIds].sort();
  const conversationKey = `${canonicalParticipantIds.join(':')}:${internshipId || 'general'}`;
  // Reuse an existing conversation between the exact same participants if one exists
  const existing = await Conversation.findOne({
    participantIds: { $all: requestedParticipantIds, $size: requestedParticipantIds.length },
    internshipId,
  });
  if (existing) return existing;

  try {
    return await Conversation.create({ participantIds: canonicalParticipantIds, internshipId, conversationKey });
  } catch (error) {
    if (error.code === 11000) return Conversation.findOne({ conversationKey });
    throw error;
  }
}

async function getConversationsForUser(userId) {
  return Conversation.find({ participantIds: userId }).sort({ lastMessageAt: -1, createdAt: -1 });
}

async function getParticipantIds(conversationId) {
  const conversation = await Conversation.findById(conversationId).select('participantIds');
  return conversation?.participantIds || [];
}

async function getPublicKeys(conversationId, userId) {
  const conversation = await Conversation.findById(conversationId).select('participantIds');
  if (!conversation || !conversation.participantIds.includes(String(userId))) return null;
  const keys = await UserKey.find({ userId: { $in: conversation.participantIds } })
    .select('userId algorithm publicKey -_id');
  return { participantIds: conversation.participantIds, keys };
}

async function getConversationById(conversationId) {
  return Conversation.findById(conversationId);
}

async function isParticipant(conversationId, userId) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return false;
  return conversation.participantIds.includes(userId);
}

async function touchLastMessageAt(conversationId) {
  await Conversation.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() });
}

module.exports = {
  createConversation,
  getConversationsForUser,
  getParticipantIds,
  getPublicKeys,
  getConversationById,
  isParticipant,
  touchLastMessageAt,
};
