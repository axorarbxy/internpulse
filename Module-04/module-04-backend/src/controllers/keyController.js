const UserKey = require('../models/UserKey');
const { ok, fail } = require('../utils/apiResponse');
const { isNonEmptyString } = require('../utils/validators');

async function register(req, res, next) {
  try {
    const { algorithm, publicKey } = req.body;
    if (algorithm !== 'ECDH-P256' || !isNonEmptyString(publicKey, 5000)) {
      return fail(res, 400, 'Invalid public key', 'VALIDATION_ERROR');
    }
    const key = await UserKey.findOneAndUpdate(
      { userId: String(req.user.id) },
      { userId: String(req.user.id), algorithm, publicKey },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return ok(res, { userId: key.userId, algorithm: key.algorithm, publicKey: key.publicKey });
  } catch (err) { return next(err); }
}

module.exports = { register };