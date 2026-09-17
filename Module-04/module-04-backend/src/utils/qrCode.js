// INTERNAL MODULE 4 FUNCTIONALITY — QR code generation for certificate verification.
// The QR encodes ONLY the public verification URL, never raw certificate data.
const QRCode = require('qrcode');
const config = require('../config/env');

async function buildVerificationQrDataUrl(certificateId) {
  const verificationUrl = `${config.publicAppUrl}/verify/${certificateId}`;
  const dataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 300 });
  return { verificationUrl, dataUrl };
}

module.exports = { buildVerificationQrDataUrl };
