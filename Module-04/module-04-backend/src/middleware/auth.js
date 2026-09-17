// EXTERNAL INTEGRATION DEPENDENCY — verifies JWTs issued by Module 1.
// Module 4 does NOT issue tokens; it only trusts the shared JWT_SECRET.
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { fail } = require('../utils/apiResponse');
const logger = require('../utils/logger');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return fail(res, 401, 'Authentication token missing', 'UNAUTHENTICATED');
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    // Expected shape from Module 1: { userId, role, ...}
    req.user = { id: payload.userId || payload.id, role: payload.role };
    if (!req.user.id || !req.user.role) {
      throw new Error('Token missing userId/role claims');
    }
    return next();
  } catch (err) {
    logger.warn('JWT verification failed', { reason: err.message });
    return fail(res, 401, 'Invalid or expired token', 'INVALID_TOKEN');
  }
}

// Socket.IO handshake auth — same JWT, different transport
function verifySocketToken(token) {
  const payload = jwt.verify(token, config.jwtSecret);
  const user = { id: payload.userId || payload.id, role: payload.role };
  if (!user.id || !user.role) throw new Error('Token missing userId/role claims');
  return user;
}

module.exports = { authenticate, verifySocketToken };
