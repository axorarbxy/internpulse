// INTERNAL MODULE 4 FUNCTIONALITY — tamper-proof certificate generation & verification.
// EXTERNAL INTEGRATION DEPENDENCY — authoritative internship/student/company data
// comes from Module 1; Module 4 snapshots it at issue time rather than owning it.
const Certificate = require('../models/Certificate');
const module1Adapter = require('../integration/module1Adapter');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const { hashCertificateData, signHash, verifySignature, generateCertificateId } = require('../utils/certificateCrypto');
const { buildVerificationQrDataUrl } = require('../utils/qrCode');

async function issueCertificate(internshipId, actorId) {
  const internship = await module1Adapter.getInternship(internshipId);
  if (!internship) {
    const err = new Error('Internship not found (Module 1)');
    err.statusCode = 404;
    err.errorCode = 'NOT_FOUND';
    throw err;
  }

  const [student, company] = await Promise.all([
    module1Adapter.getUser(internship.studentId),
    module1Adapter.getUser(internship.companyId),
  ]);

  const certificateId = generateCertificateId();
  const dataSnapshot = {
    studentName: student.name,
    companyName: company.name,
    internshipTitle: internship.title,
    startDate: internship.startDate,
    endDate: internship.endDate,
  };

  const canonicalPayload = { certificateId, internshipId, ...dataSnapshot };
  const certificateHash = hashCertificateData(canonicalPayload);
  const signature = signHash(certificateHash);
  const { verificationUrl } = await buildVerificationQrDataUrl(certificateId);

  const certificate = await Certificate.create({
    certificateId,
    internshipId,
    studentId: internship.studentId,
    companyId: internship.companyId,
    dataSnapshot,
    certificateHash,
    signature,
    verificationUrl,
  });

  await notificationService.createNotification({
    recipientId: internship.studentId,
    type: 'CERTIFICATE_GENERATED',
    title: 'Your certificate is ready',
    message: `Certificate ${certificateId} has been generated for "${internship.title}".`,
    relatedEntityType: 'certificate',
    relatedEntityId: certificateId,
  });

  await auditService.record({
    actorId,
    action: 'CERTIFICATE_GENERATED',
    entityType: 'certificate',
    entityId: certificateId,
  });

  return certificate;
}

async function getCertificateQr(certificateId) {
  return buildVerificationQrDataUrl(certificateId);
}

async function getCertificateById(certificateId) {
  return Certificate.findOne({ certificateId });
}

async function verifyCertificate(certificateId) {
  const certificate = await Certificate.findOne({ certificateId });
  if (!certificate) {
    return { valid: false, certificateId, verificationStatus: 'NOT_FOUND' };
  }

  const canonicalPayload = {
    certificateId: certificate.certificateId,
    internshipId: certificate.internshipId,
    ...certificate.dataSnapshot.toObject(),
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

module.exports = { issueCertificate, getCertificateQr, getCertificateById, verifyCertificate };
