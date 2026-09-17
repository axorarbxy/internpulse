// INTERNAL MODULE 4 FUNCTIONALITY — tamper-proof certificate hashing & signing
// Uses Node's crypto module. Canonicalizes certificate data before hashing so
// re-serialization order never changes the hash. Signature = HMAC-SHA256 with
// CERTIFICATE_SIGNING_KEY (swap for RSA/ECDSA keypair signing in production —
// the interface below stays identical).
const crypto = require('crypto');
const config = require('../config/env');

function canonicalize(obj) {
  // Stable key ordering, deep-sorted, so the same data always hashes the same way
  const sortKeys = (value) => {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === 'object') {
      return Object.keys(value)
        .sort()
        .reduce((acc, key) => {
          acc[key] = sortKeys(value[key]);
          return acc;
        }, {});
    }
    return value;
  };
  return JSON.stringify(sortKeys(obj));
}

function hashCertificateData(certificateData) {
  const canonical = canonicalize(certificateData);
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

function signHash(hash) {
  return crypto
    .createHmac('sha256', config.certificateSigningKey)
    .update(hash)
    .digest('hex');
}

function verifySignature(hash, signature) {
  const expected = signHash(hash);
  // timing-safe comparison
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function generateCertificateId() {
  return `CERT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

module.exports = {
  canonicalize,
  hashCertificateData,
  signHash,
  verifySignature,
  generateCertificateId,
};
