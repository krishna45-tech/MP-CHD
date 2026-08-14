// =============================================================================
// Dashboard & analytics routes.
// =============================================================================
const router = require('express').Router();
const dashboard = require('../controllers/dashboardController');
const analytics = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.get('/dashboard', authenticate, dashboard.getSummary);
router.get('/dashboard/notifications', authenticate, dashboard.getNotifications);
router.get('/dashboard/activities', authenticate, dashboard.getActivities);
router.get('/dashboard/tips', authenticate, dashboard.getHealthTips);
router.get('/analytics', authenticate, analytics.getAnalytics);

module.exports = router;
