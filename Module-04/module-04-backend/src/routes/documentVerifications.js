const express = require('express');
const { authenticate, authenticateService } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const controller = require('../controllers/documentVerificationController');

const router = express.Router();

// Module 3 posts results using the shared internal service key, not an end-user JWT.
router.post('/', authenticateService, controller.receive);
router.post('/resolution', authenticateService, controller.resolve);
router.get('/:documentId', authenticate, requireRole('STUDENT', 'COMPANY', 'INSTITUTION', 'ADMIN'), controller.getOne);

module.exports = router;
