const express = require('express');
const { authenticate } = require('../middleware/auth');
const conversationController = require('../controllers/conversationController');
const messageController = require('../controllers/messageController');
const { messageLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(authenticate);

router.get('/', conversationController.list);
router.post('/', conversationController.create);
router.get('/:id/messages', messageController.getHistory);
router.post('/:id/messages', messageLimiter, messageController.send);

module.exports = router;
