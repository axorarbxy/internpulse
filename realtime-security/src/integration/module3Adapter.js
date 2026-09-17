// EXTERNAL INTEGRATION DEPENDENCY — Module 3 (AI/fraud/document analysis) contract.
// Module 3 is expected to call Module 4's POST /api/document-verifications with:
//   { documentId, internshipId, status, verificationScore, reason, timestamp }
// This adapter normalizes that payload into Module 4's internal shape.
// While MODULE3_MODE=mock, normalizePayload just validates shape; no outbound calls happen.
function normalizePayload(rawPayload) {
  const { documentId, internshipId, status, verificationScore, reason, verifiedBy } = rawPayload;

  if (!documentId || !status) {
    const err = new Error('Invalid Module 3 payload: documentId and status are required');
    err.statusCode = 400;
    err.errorCode = 'VALIDATION_ERROR';
    throw err;
  }

  const allowedStatuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'FLAGGED'];
  if (!allowedStatuses.includes(status)) {
    const err = new Error(`Invalid verification status: ${status}`);
    err.statusCode = 400;
    err.errorCode = 'VALIDATION_ERROR';
    throw err;
  }

  return {
    documentId,
    internshipId: internshipId || null,
    verificationStatus: status,
    verificationScore: typeof verificationScore === 'number' ? verificationScore : null,
    reason: reason || null,
    verifiedAt: new Date(),
    verifiedBy: verifiedBy || 'MODULE_3_AI',
    source: 'MODULE_3',
  };
}

module.exports = { normalizePayload };
