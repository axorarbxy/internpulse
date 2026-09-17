// INTERNAL MODULE 4 FUNCTIONALITY
const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    internshipId: { type: String, required: true },
    studentId: { type: String, required: true },
    companyId: { type: String, required: true },
    // Snapshot of authoritative data pulled from Module 1 at issue time (documented, not duplicated ongoing)
    dataSnapshot: {
      studentName: String,
      companyName: String,
      internshipTitle: String,
      startDate: Date,
      endDate: Date,
    },
    certificateHash: { type: String, required: true },
    signature: { type: String, required: true },
    verificationUrl: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'REVOKED'], default: 'ACTIVE' },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', CertificateSchema);
