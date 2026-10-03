process.env.JWT_SECRET = 'test-jwt-secret';
const jwt = require('jsonwebtoken');
const { verifySocketToken } = require('../middleware/auth');

describe('verifySocketToken', () => {
  test('accepts a valid token with userId and role', () => {
    const token = jwt.sign({ userId: 'u1', role: 'STUDENT' }, process.env.JWT_SECRET);
    const user = verifySocketToken(token);
    expect(user).toEqual({ id: 'u1', role: 'STUDENT' });
  });

  test('rejects a token signed with the wrong secret', () => {
    const token = jwt.sign({ userId: 'u1', role: 'STUDENT' }, 'wrong-secret');
    expect(() => verifySocketToken(token)).toThrow();
  });

  test('rejects an expired token', () => {
    const token = jwt.sign({ userId: 'u1', role: 'STUDENT' }, process.env.JWT_SECRET, { expiresIn: -10 });
    expect(() => verifySocketToken(token)).toThrow();
  });

  test('rejects a token missing role claim', () => {
    const token = jwt.sign({ userId: 'u1' }, process.env.JWT_SECRET);
    expect(() => verifySocketToken(token)).toThrow();
  });

  test('rejects unknown roles even when the token signature is valid', () => {
    const token = jwt.sign({ userId: 'u1', role: 'SUPERUSER' }, process.env.JWT_SECRET);
    expect(() => verifySocketToken(token)).toThrow('Token has no valid user role');
  });

  test('normalizes the legacy INSTITUTE role', () => {
    const token = jwt.sign({ userId: 'u1', role: 'INSTITUTE' }, process.env.JWT_SECRET);
    expect(verifySocketToken(token)).toEqual({ id: 'u1', role: 'INSTITUTION' });
  });
});
