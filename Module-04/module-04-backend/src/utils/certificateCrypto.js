// INTERNAL MODULE 4 FUNCTIONALITY — tamper-proof certificate hashing & signing.
// Prefer an ECDSA P-256 keypair when a private/public PEM pair is configured.
// If no asymmetric keypair is present, the legacy HMAC fallback remains for
// backwards compatibility with existing deployments.
const crypto = require('crypto');
const config = require('../config/env');

function canonicalize(obj) {
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

function getEcdsaSigningKey() {
  const privatePem = (config.certificateSigningPrivateKey || process.env.CERTIFICATE_SIGNING_PRIVATE_KEY || '').trim();
  const publicPem = (config.certificateSigningPublicKey || process.env.CERTIFICATE_SIGNING_PUBLIC_KEY || '').trim();

  if (!privatePem && !publicPem) return null;

  try {
    const privateKey = privatePem ? crypto.createPrivateKey(privatePem) : null;
    const publicKey = publicPem ? crypto.createPublicKey(publicPem) : privateKey ? crypto.createPublicKey(privatePem) : null;

    if (!privateKey && !publicKey) return null;
    return { privateKey, publicKey };
  } catch (error) {
    return null;
  }
}

function signHash(hash) {
  const ecdsa = getEcdsaSigningKey();
  if (ecdsa && ecdsa.privateKey) {
    return crypto.sign('sha256', Buffer.from(hash, 'hex'), ecdsa.privateKey).toString('hex');
  }

  const secret = config.certificateSigningKey || process.env.CERTIFICATE_SIGNING_KEY || '';
  return crypto.createHmac('sha256', secret).update(hash).digest('hex');
}

function verifySignature(hash, signature) {
  const ecdsa = getEcdsaSigningKey();
  if (ecdsa && ecdsa.publicKey) {
    try {
      return crypto.verify('sha256', Buffer.from(hash, 'hex'), ecdsa.publicKey, Buffer.from(signature, 'hex'));
    } catch {
      return false;
    }
  }

  const expected = signHash(hash);
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
