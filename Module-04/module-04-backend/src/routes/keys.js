const express = require('express');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/keyController');

const router = express.Router();
router.use(authenticate);
router.put('/me', controller.register);

module.exports = router;