// INTERNAL MODULE 4 FUNCTIONALITY — receives & stores results from Module 3,
// notifies the relevant user, and writes an audit entry. Does NOT run any AI model.
const DocumentVerification = require('../models/DocumentVerification');
const module3Adapter = require('../integration/module3Adapter');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const module1Adapter = require('../integration/module1Adapter');

async function receiveVerificationResult(rawPayload, actorId = 'MODULE_3') {
  const normalized = module3Adapter.normalizePayload(rawPayload);

  const upsertQuery = normalized.flagId ? { flagId: normalized.flagId } : { documentId: normalized.documentId };

  const record = await DocumentVerification.findOneAndUpdate(
    upsertQuery,
    normalized,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Determine recipient: prefer the internship's student if known
  let recipientId = null;
  if (normalized.internshipId) {
    const internship = await module1Adapter.getInternship(normalized.internshipId);
    recipientId = internship ? internship.studentId : null;
  }

  if (recipientId) {
    const isFlagged = normalized.verificationStatus === 'FLAGGED' || normalized.verificationStatus === 'REJECTED';
    await notificationService.createNotification({
      recipientId,
      type: isFlagged ? 'FRAUD_FLAG' : 'DOCUMENT_VERIFICATION_RESULT',
      title: isFlagged ? 'Document flagged for review' : 'Document verification updated',
      message: `Document ${normalized.documentId} status: ${normalized.verificationStatus}`,
      relatedEntityType: 'document',
      relatedEntityId: normalized.documentId,
    });
  }

  await auditService.record({
    actorId,
    action: 'DOCUMENT_VERIFICATION_STATUS_CHANGED',
    entityType: 'document_verification',
    entityId: normalized.documentId,
    metadata: { status: normalized.verificationStatus, source: normalized.source },
  });

  return record;
}

async function getVerificationByDocumentId(documentId) {
  return DocumentVerification.findOne({ documentId });
}

async function recordReviewResolution({ flagId, status, reason, verifiedBy }) {
  const record = await DocumentVerification.findOneAndUpdate(
    { flagId },
    {
      verificationStatus: status,
      resolutionOutcome: status === 'VERIFIED' ? 'CLEARED' : 'CONFIRMED',
      resolutionNote: reason || '',
      verifiedBy: verifiedBy || 'INSTITUTION_REVIEWER',
      verifiedAt: new Date(),
    },
    { new: true }
  );
  if (!record) {
    const error = new Error('Review flag not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  await auditService.record({
    actorId: verifiedBy || 'INSTITUTION_REVIEWER',
    action: 'DOCUMENT_VERIFICATION_REVIEW_RESOLVED',
    entityType: 'document_verification',
    entityId: record.documentId,
    metadata: { flagId, status, resolutionNote: reason || '' },
  });
  return record;
}

module.exports = { receiveVerificationResult, getVerificationByDocumentId, recordReviewResolution };
