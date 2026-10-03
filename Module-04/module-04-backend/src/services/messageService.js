// INTERNAL MODULE 4 FUNCTIONALITY
// SECURITY: this service only ever handles ciphertext. It has no concept of
// plaintext and must never attempt to decrypt or log message content.
const Message = require('../models/Message');
const conversationService = require('./conversationService');
const auditService = require('./auditService');
const notificationService = require('./notificationService');

async function sendMessage({ conversationId, senderId, ciphertext, iv }) {
  const message = await Message.create({ conversationId, senderId, ciphertext, iv, readBy: [senderId] });
  await conversationService.touchLastMessageAt(conversationId);
  const participantIds = await conversationService.getParticipantIds(conversationId);
  await Promise.all(participantIds.filter((id) => String(id) !== String(senderId)).map((recipientId) => notificationService.createNotification({
    recipientId: String(recipientId),
    type: 'MESSAGE_RECEIVED',
    title: 'New encrypted message',
    message: 'You have a new end-to-end encrypted message.',
    relatedEntityType: 'conversation',
    relatedEntityId: String(conversationId),
  })));
  return message;
}

async function getMessages(conversationId, { page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Message.find({ conversationId }).sort({ createdAt: 1 }).skip(skip).limit(limit),
    Message.countDocuments({ conversationId }),
  ]);
  return { items, total, page, limit };
}

async function markMessageRead(messageId, userId) {
  const message = await Message.findById(messageId).select('conversationId');
  if (!message || !(await conversationService.isParticipant(String(message.conversationId), String(userId)))) return null;
  return Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } }, { new: true });
}

async function logUnauthorizedAccess(userId, conversationId) {
  await auditService.record({
    actorId: userId,
    action: 'CONVERSATION_ACCESS_DENIED',
    entityType: 'conversation',
    entityId: conversationId,
  });
}

module.exports = { sendMessage, getMessages, markMessageRead, logUnauthorizedAccess };
