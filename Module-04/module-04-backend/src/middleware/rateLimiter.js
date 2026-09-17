// INTERNAL MODULE 4 FUNCTIONALITY — rate limiting for sensitive/high-traffic routes
const rateLimit = require('express-rate-limit');

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages sent, slow down', errorCode: 'RATE_LIMITED' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests', errorCode: 'RATE_LIMITED' },
});

module.exports = { messageLimiter, generalLimiter };
