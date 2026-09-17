// INTERNAL MODULE 4 FUNCTIONALITY
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true, index: true }, // Module 1 userId
    type: {
      type: String,
      required: true,
      enum: [
        'MESSAGE_RECEIVED',
        'INTERNSHIP_UPDATE',
        'PROGRESS_REMINDER',
        'DOCUMENT_VERIFICATION_RESULT',
        'CERTIFICATE_GENERATED',
        'CERTIFICATE_VERIFICATION',
        'COMPANY_ACTION',
        'STUDENT_ACTION',
        'FRAUD_FLAG',
        'INTERNSHIP_STATUS_CHANGE',
        'EVALUATION_EVENT',
      ],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedEntityType: { type: String }, // e.g. 'conversation', 'certificate', 'internship'
    relatedEntityId: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
