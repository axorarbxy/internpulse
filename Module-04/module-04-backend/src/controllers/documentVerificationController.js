// INTERNAL MODULE 4 FUNCTIONALITY
const documentVerificationService = require('../services/documentVerificationService');
const { ok, fail } = require('../utils/apiResponse');

// EXTERNAL INTEGRATION DEPENDENCY — Module 3 posts results here
async function receive(req, res, next) {
  try {
    const record = await documentVerificationService.receiveVerificationResult(req.body, req.user?.id || 'MODULE_3');
    return ok(res, record, 201);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const record = await documentVerificationService.getVerificationByDocumentId(req.params.documentId);
    if (!record) return fail(res, 404, 'Document verification not found', 'NOT_FOUND');
    return ok(res, record);
  } catch (err) { next(err); }
}

module.exports = { receive, getOne };
