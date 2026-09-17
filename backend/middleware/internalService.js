module.exports = function internalService(req, res, next) {
  const expectedKey = process.env.INTERNAL_SERVICE_KEY;
  const receivedKey = req.headers['x-internal-service-key'];

  if (!expectedKey || receivedKey !== expectedKey) {
    return res.status(401).json({ message: 'Internal service authentication required' });
  }

  return next();
};
