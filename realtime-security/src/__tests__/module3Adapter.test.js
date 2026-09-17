const { normalizePayload } = require('../integration/module3Adapter');

describe('module3Adapter.normalizePayload', () => {
  test('rejects missing documentId', () => {
    expect(() => normalizePayload({ status: 'VERIFIED' })).toThrow();
  });

  test('rejects invalid status', () => {
    expect(() => normalizePayload({ documentId: 'd1', status: 'NOT_A_STATUS' })).toThrow();
  });

  test('normalizes a valid payload', () => {
    const result = normalizePayload({ documentId: 'd1', status: 'FLAGGED', reason: 'mismatch' });
    expect(result.documentId).toBe('d1');
    expect(result.verificationStatus).toBe('FLAGGED');
    expect(result.source).toBe('MODULE_3');
  });
});
