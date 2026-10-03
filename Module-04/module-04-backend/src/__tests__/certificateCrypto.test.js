const crypto = require('crypto');

function loadCryptoModule() {
  jest.resetModules();
  return require('../utils/certificateCrypto');
}

process.env.CERTIFICATE_SIGNING_KEY = 'test-signing-key';
delete process.env.CERTIFICATE_SIGNING_PRIVATE_KEY;
delete process.env.CERTIFICATE_SIGNING_PUBLIC_KEY;
const {
  hashCertificateData,
  signHash,
  verifySignature,
  generateCertificateId,
} = loadCryptoModule();

describe('certificateCrypto', () => {
  test('hash is stable regardless of key order', () => {
    const a = hashCertificateData({ x: 1, y: 2 });
    const b = hashCertificateData({ y: 2, x: 1 });
    expect(a).toBe(b);
  });

  test('signature verifies correctly', () => {
    const hash = hashCertificateData({ certificateId: 'CERT-TEST' });
    const sig = signHash(hash);
    expect(verifySignature(hash, sig)).toBe(true);
  });

  test('detects tampering (hash mismatch)', () => {
    const original = hashCertificateData({ studentName: 'Alice' });
    const tampered = hashCertificateData({ studentName: 'Mallory' });
    expect(original).not.toBe(tampered);
  });

  test('detects invalid signature', () => {
    const hash = hashCertificateData({ certificateId: 'CERT-TEST' });
    const sig = signHash(hash);
    const badSig = sig.slice(0, -2) + '00';
    expect(verifySignature(hash, badSig)).toBe(false);
  });

  test('supports ECDSA keypair signatures', () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    process.env.CERTIFICATE_SIGNING_KEY = '';
    process.env.CERTIFICATE_SIGNING_PRIVATE_KEY = privateKey;
    process.env.CERTIFICATE_SIGNING_PUBLIC_KEY = publicKey;

    const { hashCertificateData: hashWithKeys, signHash: signWithKeys, verifySignature: verifyWithKeys } = loadCryptoModule();
    const hash = hashWithKeys({ certificateId: 'CERT-ECDSA' });
    const sig = signWithKeys(hash);
    expect(sig.length).toBeGreaterThan(128);
    expect(verifyWithKeys(hash, sig)).toBe(true);
  });

  test('generates unique certificate IDs', () => {
    const ids = new Set(Array.from({ length: 50 }, generateCertificateId));
    expect(ids.size).toBe(50);
  });
});
