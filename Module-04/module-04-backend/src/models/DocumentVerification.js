// INTERNAL MODULE 4 FUNCTIONALITY — mirrors verification results received from Module 3
const mongoose = require('mongoose');

const DocumentVerificationSchema = new mongoose.Schema(
  {
    documentId: { type: String, required: true, index: true },
    internshipId: { type: String },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'FLAGGED'],
      default: 'PENDING',
    },
    verificationScore: { type: Number },
    reason: { type: String },
    verifiedAt: { type: Date },
    verifiedBy: { type: String }, // 'MODULE_3_AI' or an admin userId
    source: { type: String, default: 'MODULE_3' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentVerification', DocumentVerificationSchema);
