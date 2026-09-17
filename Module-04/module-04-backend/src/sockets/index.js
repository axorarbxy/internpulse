// INTERNAL MODULE 4 FUNCTIONALITY — Socket.IO server setup.
// Every socket must authenticate via JWT before joining any room.
const { Server } = require('socket.io');
const { verifySocketToken } = require('../middleware/auth');
const conversationService = require('../services/conversationService');
const messageService = require('../services/messageService');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');
const logger = require('../utils/logger');
const config = require('../config/env');

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: config.socketOrigin, credentials: true },
  });

  // Auth handshake — token passed in `auth: { token }` from the client
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error('Missing token');
      const user = verifySocketToken(token);
      socket.user = user;
      return next();
    } catch (err) {
      logger.warn('Socket authentication failed', { reason: err.message });
      return next(new Error('UNAUTHENTICATED'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId } = socket.user;
    socket.join(`user:${userId}`);
    logger.debug('Socket connected', { userId });

    socket.on('join_conversation', async ({ conversationId }, callback) => {
      try {
        const authorized = await conversationService.isParticipant(conversationId, userId);
        if (!authorized) {
          await auditService.record({
            actorId: userId,
            action: 'SOCKET_CONVERSATION_JOIN_DENIED',
            entityType: 'conversation',
            entityId: conversationId,
          });
          return callback?.({ success: false, message: 'Not authorized for this conversation', errorCode: 'FORBIDDEN' });
        }
        socket.join(`conversation:${conversationId}`);
        return callback?.({ success: true });
      } catch (err) {
        return callback?.({ success: false, message: 'Failed to join conversation', errorCode: 'INTERNAL_ERROR' });
      }
    });

    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Payload contains only ciphertext + iv — server never decrypts
    socket.on('send_message', async ({ conversationId, ciphertext, iv }, callback) => {
      try {
        const authorized = await conversationService.isParticipant(conversationId, userId);
        if (!authorized) {
          return callback?.({ success: false, message: 'Not authorized', errorCode: 'FORBIDDEN' });
        }
        if (typeof ciphertext !== 'string' || typeof iv !== 'string' || ciphertext.length > 5000) {
          return callback?.({ success: false, message: 'Invalid payload', errorCode: 'VALIDATION_ERROR' });
        }

        const message = await messageService.sendMessage({ conversationId, senderId: userId, ciphertext, iv });

        io.to(`conversation:${conversationId}`).emit('message:new', {
          id: message._id,
          conversationId,
          senderId: userId,
          ciphertext: message.ciphertext,
          iv: message.iv,
          createdAt: message.createdAt,
        });
        socket.to(`conversation:${conversationId}`).emit('message:delivered', { id: message._id });

        return callback?.({ success: true, id: message._id });
      } catch (err) {
        logger.error('send_message failed', { error: err.message });
        return callback?.({ success: false, message: 'Failed to send message', errorCode: 'INTERNAL_ERROR' });
      }
    });

    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user:typing', { userId, conversationId, typing: true });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user:typing', { userId, conversationId, typing: false });
    });

    socket.on('mark_notification_read', async ({ notificationId }, callback) => {
      try {
        const notification = await notificationService.markAsRead(userId, notificationId);
        return callback?.({ success: !!notification });
      } catch (err) {
        return callback?.({ success: false, errorCode: 'INTERNAL_ERROR' });
      }
    });

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { userId });
    });
  });

  notificationService.attachSocketServer(io);
  return io;
}

module.exports = { initSocketServer };
