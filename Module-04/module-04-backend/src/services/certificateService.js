// INTERNAL MODULE 4 FUNCTIONALITY — tamper-proof certificate generation & verification.
// EXTERNAL INTEGRATION DEPENDENCY — authoritative internship/student/company data
// comes from Module 1; Module 4 snapshots it at issue time rather than owning it.
const Certificate = require('../models/Certificate');
const DocumentVerification = require('../models/DocumentVerification');
const env = require('../config/env');
const module1Adapter = require('../integration/module1Adapter');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const { hashCertificateData, signHash, verifySignature, generateCertificateId } = require('../utils/certificateCrypto');
const { buildVerificationQrDataUrl } = require('../utils/qrCode');

function canonicalSnapshot(snapshot) {
  return {
    ...snapshot,
    startDate: snapshot.startDate ? new Date(snapshot.startDate).toISOString() : null,
    endDate: snapshot.endDate ? new Date(snapshot.endDate).toISOString() : null,
  };
}

async function issueCertificate(applicationId, actorId, actorRole, options = {}) {
  const application = await module1Adapter.getCompletedApplication(applicationId);
  if (!application || application.applicationStatus !== 'COMPLETED') {
    const err = new Error('A completed internship application is required');
    err.statusCode = 409;
    err.errorCode = 'APPLICATION_NOT_COMPLETED';
    throw err;
  }
  if (actorRole === 'COMPANY' && String(application.companyId) !== String(actorId)) {
    const err = new Error('You can only issue certificates for your own interns');
    err.statusCode = 403;
    err.errorCode = 'FORBIDDEN';
    throw err;
  }

  const existing = await Certificate.findOne({ applicationId });
  if (existing) return existing;

  const openFlags = await DocumentVerification.find({
    internshipId: application.internshipId,
    verificationStatus: { $in: ['FLAGGED', 'UNDER_REVIEW', 'REJECTED'] },
  }).lean();
  const gateMode = (env.fraudGateMode || 'warn').toLowerCase();
  const overrideReason = typeof options.overrideReason === 'string' ? options.overrideReason.trim() : '';
  const flagIds = openFlags.map((flag) => flag.flagId || flag.documentId);

  if (openFlags.length && gateMode === 'enforce') {
    if (actorRole !== 'ADMIN' || overrideReason.length < 10) {
      await notificationService.createNotification({
        recipientId: application.companyId,
        type: 'FRAUD_FLAG',
        title: 'Certificate blocked pending review',
        message: `Certificate issuance for application ${applicationId} is blocked while review flags remain open: ${flagIds.join(', ')}.`,
        relatedEntityType: 'internship',
        relatedEntityId: application.internshipId,
      });
      const err = new Error(`Certificate issuance is blocked pending human review. Flag IDs: ${flagIds.join(', ')}`);
      err.statusCode = 409;
      err.errorCode = 'FLAG_PENDING_REVIEW';
      throw err;
    }

    await auditService.record({
      actorId,
      action: 'CERTIFICATE_ISSUED_WITH_OVERRIDE',
      entityType: 'certificate',
      entityId: applicationId,
      metadata: { applicationId, internshipId: application.internshipId, overrideReason, flagIds },
    });
  }

  const certificateId = generateCertificateId();
  const dataSnapshot = {
    studentName: application.studentName,
    companyName: application.companyName,
    internshipTitle: application.internshipTitle,
    startDate: application.startDate,
    endDate: application.endDate,
  };
  const canonicalPayload = {
    certificateId,
    applicationId,
    internshipId: application.internshipId,
    ...canonicalSnapshot(dataSnapshot),
  };
  const certificateHash = hashCertificateData(canonicalPayload);
  const signature = signHash(certificateHash);
  const { verificationUrl } = await buildVerificationQrDataUrl(certificateId);
  const certificate = await Certificate.create({
    certificateId,
    applicationId,
    internshipId: application.internshipId,
    studentId: application.studentId,
    companyId: application.companyId,
    dataSnapshot,
    certificateHash,
    signature,
    verificationUrl,
    fraudWarnings: openFlags.map((flag) => ({
      flagId: flag.flagId || flag.documentId,
      status: flag.verificationStatus,
      reason: flag.reason || 'Review pending',
    })),
  });

  await notificationService.createNotification({
    recipientId: application.studentId,
    type: 'CERTIFICATE_GENERATED',
    title: 'Your certificate is ready',
    message: `Certificate ${certificateId} has been generated for "${application.internshipTitle}"${openFlags.length ? ' with review warnings attached' : ''}.`,
    relatedEntityType: 'certificate',
    relatedEntityId: certificateId,
  });
  await auditService.record({
    actorId,
    action: openFlags.length ? 'CERTIFICATE_GENERATED_WITH_WARNING' : 'CERTIFICATE_GENERATED',
    entityType: 'certificate',
    entityId: certificateId,
    metadata: { applicationId, internshipId: application.internshipId, flagIds },
  });

  return certificate;
}

async function getCertificateQr(certificateId) {
  return buildVerificationQrDataUrl(certificateId);
}

async function getCertificateById(certificateId) {
  return Certificate.findOne({ certificateId });
}

async function getCertificatesForStudent(studentId) {
  return Certificate.find({ studentId }).sort({ issuedAt: -1 }).lean();
}

async function verifyCertificate(certificateId) {
  const certificate = await Certificate.findOne({ certificateId });
  if (!certificate) {
    return { valid: false, certificateId, verificationStatus: 'NOT_FOUND' };
  }

  const canonicalPayload = {
    certificateId: certificate.certificateId,
    applicationId: certificate.applicationId,
    internshipId: certificate.internshipId,
    ...canonicalSnapshot(certificate.dataSnapshot.toObject()),
  };
  const recomputedHash = hashCertificateData(canonicalPayload);
  const hashMatches = recomputedHash === certificate.certificateHash;
  const signatureValid = verifySignature(certificate.certificateHash, certificate.signature);

  const tampered = !hashMatches || !signatureValid;
  const revoked = certificate.status === 'REVOKED';

  await auditService.record({
    actorId: 'PUBLIC',
    action: 'CERTIFICATE_VERIFIED',
    entityType: 'certificate',
    entityId: certificateId,
    metadata: { valid: !tampered && !revoked },
  });

  if (tampered) {
    return { valid: false, certificateId, verificationStatus: 'TAMPERED' };
  }
  if (revoked) {
    return { valid: false, certificateId, verificationStatus: 'REVOKED' };
  }

  return {
    valid: true,
    certificateId: certificate.certificateId,
    studentName: certificate.dataSnapshot.studentName,
    companyName: certificate.dataSnapshot.companyName,
    internshipTitle: certificate.dataSnapshot.internshipTitle,
    issuedAt: certificate.issuedAt,
    verificationStatus: 'VALID',
  };
}

module.exports = { issueCertificate, getCertificateQr, getCertificateById, getCertificatesForStudent, verifyCertificate };
