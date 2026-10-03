const express = require('express');
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const controller = require('../controllers/organizationRegistrationController');

const router = express.Router();
router.use(require('../../sign-in/backend/authRoutes'));
router.get('/organization-registrations', auth, requireRole('ADMIN'), controller.list);
router.patch('/organization-registrations/:registrationId', auth, requireRole('ADMIN'), controller.review);

module.exports = router;
