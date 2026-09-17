const express = require('express');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/messageController');

const router = express.Router();
router.use(authenticate);

router.patch('/:id/read', controller.markRead);

module.exports = router;
