const router = require('../../backend/node_modules/express').Router();
const controller = require('./authController');
const authenticate = require('../../backend/middleware/authMiddleware');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', authenticate, controller.me);

module.exports = router;