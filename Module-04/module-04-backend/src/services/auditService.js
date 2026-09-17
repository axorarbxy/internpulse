// INTERNAL MODULE 4 FUNCTIONALITY — audit trail. Metadata must stay minimal and
// privacy-conscious; never store plaintext message content here.
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

async function record({ actorId, action, entityType, entityId, metadata = {} }) {
  try {
    return await AuditLog.create({ actorId, action, entityType, entityId, metadata });
  } catch (err) {
    // Audit logging must never crash the main request flow
    logger.error('Failed to write audit log', { action, entityType, error: err.message });
    return null;
  }
}

module.exports = { record };
