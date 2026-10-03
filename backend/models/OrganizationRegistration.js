const pool = require('../config/db');

async function createPending(userId, role, organizationName, details) {
  return (await pool.query(
    `INSERT INTO organization_registration_requests (user_id, requested_role, organization_name, details)
     VALUES ($1, $2, $3, $4::JSONB)
     RETURNING id, user_id, requested_role, organization_name, details, status, created_at`,
    [userId, role, organizationName, JSON.stringify(details || {})],
  )).rows[0];
}

async function byUserId(userId) {
  return (await pool.query(
    'SELECT id, user_id, requested_role, organization_name, details, status FROM organization_registration_requests WHERE user_id=$1',
    [userId],
  )).rows[0];
}

async function list(status) {
  const params = status ? [status] : [];
  const filter = status ? 'WHERE requests.status=$1' : '';
  return (await pool.query(
    `SELECT requests.id, requests.user_id, requests.requested_role, requests.organization_name,
            requests.details, requests.status, requests.created_at, users.name, users.email
     FROM organization_registration_requests requests
     JOIN users ON users.id=requests.user_id
     ${filter}
     ORDER BY requests.created_at DESC`,
    params,
  )).rows;
}

async function review(id, status, reviewedBy, note) {
  return (await pool.query(
    `UPDATE organization_registration_requests
     SET status=$1, reviewed_by=$2, reviewed_at=CURRENT_TIMESTAMP, review_note=$3
     WHERE id=$4
     RETURNING id, user_id, requested_role, organization_name, details, status, created_at, reviewed_at, review_note`,
    [status, reviewedBy, note || null, id],
  )).rows[0];
}

module.exports = { createPending, byUserId, list, review };