const express = require('express');
const notifications = require('./notifications');
const conversations = require('./conversations');
const messages = require('./messages');
const certificates = require('./certificates');
const documentVerifications = require('./documentVerifications');

const router = express.Router();

router.use('/notifications', notifications);
router.use('/conversations', conversations);
router.use('/messages', messages);
router.use('/certificates', certificates);
router.use('/document-verifications', documentVerifications);

module.exports = router;
