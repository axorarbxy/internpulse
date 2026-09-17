// INTERNAL MODULE 4 FUNCTIONALITY
const certificateService = require('../services/certificateService');
const { streamCertificatePdf } = require('../utils/pdfGenerator');
const { ok, fail } = require('../utils/apiResponse');

async function issue(req, res, next) {
  try {
    const { internshipId } = req.body;
    if (!internshipId) return fail(res, 400, 'internshipId is required', 'VALIDATION_ERROR');
    // Only COMPANY or ADMIN can issue; enforced via requireRole in the route
    const certificate = await certificateService.issueCertificate(internshipId, req.user.id);
    return ok(res, certificate, 201);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const certificate = await certificateService.getCertificateById(req.params.id);
    if (!certificate) return fail(res, 404, 'Certificate not found', 'NOT_FOUND');

    const isOwner = certificate.studentId === req.user.id || certificate.companyId === req.user.id;
    if (!isOwner && req.user.role !== 'ADMIN' && !['INSTITUTE', 'INSTITUTION'].includes(req.user.role)) {
      return fail(res, 403, 'You are not authorized to view this certificate', 'FORBIDDEN');
    }
    return ok(res, certificate);
  } catch (err) { next(err); }
}

async function download(req, res, next) {
  try {
    const certificate = await certificateService.getCertificateById(req.params.id);
    if (!certificate) return fail(res, 404, 'Certificate not found', 'NOT_FOUND');

    const isOwner = certificate.studentId === req.user.id || certificate.companyId === req.user.id;
    if (!isOwner && req.user.role !== 'ADMIN' && !['INSTITUTE', 'INSTITUTION'].includes(req.user.role)) {
      return fail(res, 403, 'You are not authorized to download this certificate', 'FORBIDDEN');
    }

    const { dataUrl } = await certificateService.getCertificateQr(certificate.certificateId);
    return streamCertificatePdf(res, { certificate, qrDataUrl: dataUrl });
  } catch (err) { next(err); }
}

// Public endpoint — no auth required, exposes only non-sensitive fields
async function verify(req, res, next) {
  try {
    const result = await certificateService.verifyCertificate(req.params.certificateId);
    return ok(res, result);
  } catch (err) { next(err); }
}

module.exports = { issue, getOne, download, verify };
