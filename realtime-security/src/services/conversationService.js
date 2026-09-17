// INTERNAL MODULE 4 FUNCTIONALITY
const Conversation = require('../models/Conversation');

async function createConversation(participantIds, internshipId) {
  // Reuse an existing conversation between the exact same participants if one exists
  const existing = await Conversation.findOne({
    participantIds: { $all: participantIds, $size: participantIds.length },
  });
  if (existing) return existing;

  return Conversation.create({ participantIds, internshipId });
}

async function getConversationsForUser(userId) {
  return Conversation.find({ participantIds: userId }).sort({ lastMessageAt: -1, createdAt: -1 });
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
  getConversationById,
  isParticipant,
  touchLastMessageAt,
};
