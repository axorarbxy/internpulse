// INTERNAL MODULE 4 FUNCTIONALITY
const documentVerificationService = require('../services/documentVerificationService');
const module1Adapter = require('../integration/module1Adapter');
const { ok, fail } = require('../utils/apiResponse');

// EXTERNAL INTEGRATION DEPENDENCY — Module 3 posts results here
async function receive(req, res, next) {
  try {
    const record = await documentVerificationService.receiveVerificationResult(req.body, req.user?.id || 'MODULE_3');
    return ok(res, record, 201);
  } catch (err) { next(err); }
}

async function resolve(req, res, next) {
  try {
    const record = await documentVerificationService.recordReviewResolution(req.body);
    return ok(res, record);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const record = await documentVerificationService.getVerificationByDocumentId(req.params.documentId);
    if (!record) return fail(res, 404, 'Document verification not found', 'NOT_FOUND');
    if (req.user.role !== 'ADMIN') {
      if (!record.internshipId) return fail(res, 404, 'Document verification not found', 'NOT_FOUND');
      const internship = await module1Adapter.getInternship(record.internshipId);
      const isOwner = internship && [internship.studentId, internship.companyId]
        .filter(Boolean)
        .some((participantId) => String(participantId) === String(req.user.id));
      if (!isOwner) return fail(res, 404, 'Document verification not found', 'NOT_FOUND');
    }
    return ok(res, record);
  } catch (err) { next(err); }
}

module.exports = { receive, resolve, getOne };
