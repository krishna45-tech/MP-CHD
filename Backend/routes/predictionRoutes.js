// =============================================================================
// Prediction & history routes.
// =============================================================================
const router = require('express').Router();
const prediction = require('../controllers/predictionController');
const { authenticate } = require('../middleware/auth');

router.post('/predict', authenticate, prediction.createPrediction);
router.get('/predict/:id', authenticate, prediction.getPrediction);

router.get('/history', authenticate, prediction.listHistory);
router.get('/history/:id', authenticate, prediction.getHistoryItem);
router.delete('/history/:id', authenticate, prediction.deleteHistoryItem);

module.exports = router;
