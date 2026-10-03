// EXTERNAL INTEGRATION DEPENDENCY — verifies JWTs issued by Module 1.
// Module 4 does NOT issue tokens; it only trusts the shared JWT_SECRET.
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const { fail } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const allowedRoles = new Set(['STUDENT', 'COMPANY', 'INSTITUTION', 'INSTITUTE', 'ADMIN']);

function userFromPayload(payload) {
  const id = payload.userId || payload.id;
  const role = String(payload.role || '').toUpperCase();
  if (!id || !allowedRoles.has(role)) throw new Error('Token has no valid user role');
  return { id: String(id), role: role === 'INSTITUTE' ? 'INSTITUTION' : role };
}

function authenticateService(req, res, next) {
  const expected = config.module1ServiceToken;
  const received = req.headers['x-internal-service-key'];
  if (!expected || typeof received !== 'string') {
    return fail(res, 401, 'Internal service authentication required', 'UNAUTHENTICATED');
  }
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return fail(res, 401, 'Internal service authentication required', 'UNAUTHENTICATED');
  }
  return next();
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return fail(res, 401, 'Authentication token missing', 'UNAUTHENTICATED');
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = userFromPayload(payload);
    return next();
  } catch (err) {
    logger.warn('JWT verification failed', { reason: err.message });
    return fail(res, 401, 'Invalid or expired token', 'INVALID_TOKEN');
  }
}

// Socket.IO handshake auth — same JWT, different transport
function verifySocketToken(token) {
  const payload = jwt.verify(token, config.jwtSecret);
  return userFromPayload(payload);
}

module.exports = { authenticate, authenticateService, verifySocketToken };
