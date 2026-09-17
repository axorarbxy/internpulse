// INTERNAL MODULE 4 FUNCTIONALITY
const notificationService = require('../services/notificationService');
const { ok } = require('../utils/apiResponse');

async function list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const result = await notificationService.getNotifications(req.user.id, { page, limit });
    return ok(res, result);
  } catch (err) { next(err); }
}

async function unreadCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    return ok(res, { count });
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found', errorCode: 'NOT_FOUND' });
    }
    return ok(res, notification);
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return ok(res, { updated: true });
  } catch (err) { next(err); }
}

module.exports = { list, unreadCount, markRead, markAllRead };
