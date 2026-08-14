// =============================================================================
// User management routes.
// =============================================================================
const router = require('express').Router();
const user = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, user.getProfile);
router.put('/profile', authenticate, user.updateProfile);
router.put('/profile/password', authenticate, user.changePassword);

module.exports = router;
