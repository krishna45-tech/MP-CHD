// =============================================================================
// Authentication routes.
// =============================================================================
const router = require('express').Router();
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.post('/verify-email', auth.verifyEmail);
router.get('/me', authenticate, auth.me);

module.exports = router;
