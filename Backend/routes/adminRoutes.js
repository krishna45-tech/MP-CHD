// =============================================================================
// Admin routes (admin role required).
// =============================================================================
const router = require('express').Router();
const admin = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const adminOnly = [authenticate, requireRole('admin')];

router.get('/admin/stats', adminOnly, admin.getStats);
router.get('/admin/users', adminOnly, admin.getUsers);
router.delete('/admin/users/:id', adminOnly, admin.deleteUser);
router.get('/admin/activities', adminOnly, admin.getActivities);

module.exports = router;
