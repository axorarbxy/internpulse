const registrations = require('../models/OrganizationRegistration');

async function list(req, res) {
  try {
    const status = req.query.status ? String(req.query.status).toUpperCase() : 'PENDING';
    if (!['PENDING', 'APPROVED', 'REJECTED', 'ALL'].includes(status)) {
      return res.status(400).json({ message: 'Invalid registration status' });
    }
    const requests = await registrations.list(status === 'ALL' ? null : status);
    return res.json({ registrations: requests });
  } catch {
    return res.status(500).json({ message: 'Unable to load organization registrations' });
  }
}

async function review(req, res) {
  try {
    const status = String(req.body.status || '').toUpperCase();
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
    }
    const result = await registrations.review(
      Number(req.params.registrationId),
      status,
      req.user.id,
      req.body.note,
    );
    if (!result) return res.status(404).json({ message: 'Organization registration not found' });
    return res.json({ message: `Organization registration ${status.toLowerCase()}`, registration: result });
  } catch {
    return res.status(500).json({ message: 'Unable to review organization registration' });
  }
}

module.exports = { list, review };