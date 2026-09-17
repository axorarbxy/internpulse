// INTERNAL MODULE 4 FUNCTIONALITY — never store plaintext message content here
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
