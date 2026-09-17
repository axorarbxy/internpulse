const {
  hashCertificateData,
  signHash,
  verifySignature,
  generateCertificateId,
} = require('../utils/certificateCrypto');

process.env.CERTIFICATE_SIGNING_KEY = 'test-signing-key';

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

  test('generates unique certificate IDs', () => {
    const ids = new Set(Array.from({ length: 50 }, generateCertificateId));
    expect(ids.size).toBe(50);
  });
});
