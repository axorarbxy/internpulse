// INTERNAL MODULE 4 FUNCTIONALITY
// Generic enough that Module 1 / Module 2 / Module 3 events can all trigger it.
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

let ioRef = null;
function attachSocketServer(io) {
  ioRef = io;
}

async function createNotification({ recipientId, type, title, message, relatedEntityType, relatedEntityId }) {
  const notification = await Notification.create({
    recipientId,
    type,
    title,
    message,
    relatedEntityType,
    relatedEntityId,
  });

  if (ioRef) {
    ioRef.to(`user:${recipientId}`).emit('notification:new', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedEntityType: notification.relatedEntityType,
      relatedEntityId: notification.relatedEntityId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });
  } else {
    logger.debug('Socket server not attached yet; notification persisted only', { recipientId, type });
  }

  return notification;
}

async function getNotifications(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ recipientId: userId }),
  ]);
  return { items, total, page, limit };
}

async function getUnreadCount(userId) {
  return Notification.countDocuments({ recipientId: userId, isRead: false });
}

async function markAsRead(userId, notificationId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { isRead: true },
    { new: true }
  );
  if (notification && ioRef) {
    ioRef.to(`user:${userId}`).emit('notification:updated', { id: notification._id, isRead: true });
  }
  return notification;
}

async function markAllAsRead(userId) {
  await Notification.updateMany({ recipientId: userId, isRead: false }, { isRead: true });
  if (ioRef) {
    ioRef.to(`user:${userId}`).emit('notification:updated', { all: true, isRead: true });
  }
}

module.exports = {
  attachSocketServer,
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
