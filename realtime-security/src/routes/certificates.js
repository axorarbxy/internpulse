const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const controller = require('../controllers/certificateController');

const router = express.Router();

// Public verification endpoint — no auth
router.get('/verify/:certificateId', controller.verify);

router.use(authenticate);
router.post('/', requireRole('COMPANY', 'ADMIN'), controller.issue);
router.get('/:id', controller.getOne);
router.get('/:id/download', controller.download);

module.exports = router;
