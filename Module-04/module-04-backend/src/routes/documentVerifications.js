const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const controller = require('../controllers/documentVerificationController');

const router = express.Router();
router.use(authenticate);

// EXTERNAL INTEGRATION DEPENDENCY — intended caller is Module 3's service account
router.post('/', requireRole('ADMIN', 'INSTITUTE', 'INSTITUTION'), controller.receive);
router.get('/:documentId', controller.getOne);

module.exports = router;
