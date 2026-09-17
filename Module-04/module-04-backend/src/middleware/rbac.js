// INTERNAL MODULE 4 FUNCTIONALITY — server-side role-based access control.
// Roles come from Module 1's JWT claims (STUDENT, COMPANY, INSTITUTE, ADMIN).
const { fail } = require('../utils/apiResponse');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return fail(res, 403, 'You do not have permission to perform this action', 'FORBIDDEN');
    }
    return next();
  };
}

module.exports = { requireRole };
