// INTERNAL MODULE 4 FUNCTIONALITY — centralized error handler.
// Never leaks stack traces or internal details to the client.
const logger = require('../utils/logger');
const { fail } = require('../utils/apiResponse');

function notFoundHandler(req, res) {
  return fail(res, 404, 'Resource not found', 'NOT_FOUND');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', { message: err.message, path: req.path });
  const status = err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  return fail(res, status, message, err.errorCode || 'INTERNAL_ERROR');
}

module.exports = { notFoundHandler, errorHandler };
