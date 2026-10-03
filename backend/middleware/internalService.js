const crypto = require('crypto');

module.exports = function internalService(req, res, next) {
  const expectedKey = process.env.INTERNAL_SERVICE_KEY;
  const receivedKey = req.headers['x-internal-service-key'];

  if (typeof expectedKey !== 'string' || typeof receivedKey !== 'string') {
    return res.status(401).json({ message: 'Internal service authentication required' });
  }
  const expected = Buffer.from(expectedKey);
  const received = Buffer.from(receivedKey);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return res.status(401).json({ message: 'Internal service authentication required' });
  }

  return next();
};
