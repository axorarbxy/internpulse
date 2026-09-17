const express = require('express');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/notificationController');

const router = express.Router();
router.use(authenticate);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', controller.markRead);

module.exports = router;
