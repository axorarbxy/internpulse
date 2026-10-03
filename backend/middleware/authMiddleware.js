const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const jwtSecret = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  let payload;
  try {
    const token = authorization.split(' ')[1];
    payload = jwt.verify(token, jwtSecret);
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }

  const userId = payload.id || payload.userId;
  if (!Number.isInteger(Number(userId)) || Number(userId) < 1) {
    return res.status(401).json({ message: 'Invalid account token' });
  }

  try {
    const result = await pool.query(`SELECT users.id, users.role, registrations.status AS registration_status
      FROM users
      LEFT JOIN organization_registration_requests registrations ON registrations.user_id=users.id
      WHERE users.id = $1`, [Number(userId)]);
    const account = result.rows[0];
    if (!account) return res.status(401).json({ message: 'Account is no longer available' });
    if (['COMPANY', 'INSTITUTION'].includes(account.role) && ['PENDING', 'REJECTED'].includes(account.registration_status)) {
      return res.status(403).json({ message: 'Organization account is not approved' });
    }

    req.user = { ...payload, id: account.id, role: account.role };
    return next();
  } catch {
    return res.status(503).json({ message: 'Unable to verify account permissions' });
  }
};