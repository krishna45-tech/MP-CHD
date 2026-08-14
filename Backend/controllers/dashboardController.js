// =============================================================================
// Dashboard controller – summary, notifications, activities, health tips.
// =============================================================================
const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { serializeRecord, RECORD_SELECT } = require('./predictionController');

const RISK_COLORS = { low: '#43A047', medium: '#F9A825', high: '#E53935' };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const HEALTH_TIPS = [
  { id: 'tip_1', title: 'Sleep first', body: 'Adults who sleep 7–9 hours have up to 40% lower heart disease risk than short sleepers.', icon: 'nightlight', tag: 'Sleep' },
  { id: 'tip_2', title: 'Move daily', body: 'Just 30 minutes of brisk walking daily can lower blood pressure and LDL cholesterol.', icon: 'directions_walk', tag: 'Exercise' },
  { id: 'tip_3', title: 'De-stress', body: 'Chronic stress raises cortisol and heart rate. Try 10 minutes of deep breathing.', icon: 'spa', tag: 'Mindfulness' },
  { id: 'tip_4', title: 'Know your numbers', body: 'Healthy targets: BP < 120/80, LDL < 100, fasting glucose < 100 mg/dL.', icon: 'monitor_heart', tag: 'Metrics' },
  { id: 'tip_5', title: 'Eat the rainbow', body: 'A DASH-style diet with 5 servings of vegetables daily cuts CVD risk by ~15%.', icon: 'restaurant', tag: 'Nutrition' },
];

const DEFAULT_METRICS = [
  { key: 'systolicBp', label: 'Blood pressure', value: 122, unit: 'mmHg', goodRange: [90, 130], status: 'good' },
  { key: 'heartRate', label: 'Resting heart rate', value: 72, unit: 'bpm', goodRange: [60, 100], status: 'good' },
  { key: 'cholesterol', label: 'Total cholesterol', value: 198, unit: 'mg/dL', goodRange: [125, 200], status: 'warning' },
  { key: 'glucose', label: 'Fasting glucose', value: 96, unit: 'mg/dL', goodRange: [70, 100], status: 'good' },
];

function metricStatus(value, [lo, hi]) {
  if (value >= lo && value <= hi) return 'good';
  const spread = (hi - lo) * 0.2;
  return value >= lo - spread && value <= hi + spread ? 'warning' : 'danger';
}

/** Builds HealthMetric[] from the latest prediction's input, or defaults. */
function buildMetrics(input) {
  if (!input) return DEFAULT_METRICS;
  const defs = [
    { key: 'systolicBp', label: 'Blood pressure', unit: 'mmHg', goodRange: [90, 130] },
    { key: 'heartRate', label: 'Resting heart rate', unit: 'bpm', goodRange: [60, 100] },
    { key: 'cholesterol', label: 'Total cholesterol', unit: 'mg/dL', goodRange: [125, 200] },
    { key: 'glucose', label: 'Fasting glucose', unit: 'mg/dL', goodRange: [70, 100] },
  ];
  return defs.map((d) => {
    const value = input[d.key];
    return {
      ...d,
      value: value != null ? value : d.goodRange[0],
      status: value != null ? metricStatus(value, d.goodRange) : 'good',
    };
  });
}

/** GET /api/dashboard */
const getSummary = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `${RECORD_SELECT} WHERE p.user_id = $1 ORDER BY p.created_at DESC LIMIT 5`,
    [req.user.id]
  );
  const latest = rows[0];

  const monthPrefix = new Date().toISOString().slice(0, 7);
  const monthCount = rows.filter((r) => new Date(r.created_at).toISOString().startsWith(monthPrefix)).length;

  const riskScore = latest ? Number(latest.risk_score) : 18;
  const riskLevel = latest ? latest.risk_level : 'low';

  res.json({
    success: true,
    message: 'Dashboard summary retrieved.',
    data: {
      healthScore: latest ? Math.round(100 - riskScore) : 82,
      riskLevel,
      riskScore,
      recentPredictions: rows.map(serializeRecord),
      metrics: buildMetrics(latest ? latest.input : null),
      totalPredictions: rows.length > 0 ? Number((await pool.query('SELECT COUNT(*)::int AS c FROM predictions WHERE user_id = $1', [req.user.id])).rows[0].c) : 0,
      monthPredictions: monthCount,
      streakDays: 12,
    },
  });
});

/** GET /api/dashboard/notifications */
const getNotifications = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [req.user.id]
  );
  const user = rows[0];
  const { rows: preds } = await pool.query(
    'SELECT * FROM predictions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [req.user.id]
  );
  const latest = preds[0];
  const now = new Date();

  const notifications = [];

  if (latest) {
    notifications.push({
      id: 'ntf_1',
      title: 'New prediction available',
      message: `Your latest cardiac risk assessment is complete – ${Math.round(Number(latest.risk_score))}% ${latest.risk_level} risk.`,
      type: 'success',
      icon: 'insights',
      createdAt: new Date(latest.created_at).toISOString(),
      read: false,
    });
  } else {
    notifications.push({
      id: 'ntf_1',
      title: 'Welcome to CardioSight',
      message: 'Run your first cardiac risk assessment to unlock your health score.',
      type: 'info',
      icon: 'insights',
      createdAt: now.toISOString(),
      read: false,
    });
  }

  notifications.push({
    id: 'ntf_2',
    title: 'Weekly health report',
    message: 'Keep tracking your readings to unlock a weekly heart health snapshot.',
    type: 'info',
    icon: 'schedule',
    createdAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    read: true,
  });

  if (!user.height_cm || !user.weight_kg) {
    notifications.push({
      id: 'ntf_3',
      title: 'Profile incomplete',
      message: 'Add your latest vitals to improve prediction accuracy.',
      type: 'warning',
      icon: 'warning',
      createdAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
      read: true,
    });
  }

  res.json({ success: true, message: 'Notifications retrieved.', data: notifications });
});

/** GET /api/dashboard/activities */
const getActivities = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `${RECORD_SELECT} WHERE p.user_id = $1 ORDER BY p.created_at DESC LIMIT 5`,
    [req.user.id]
  );

  const activities = rows.map((row, i) => ({
    id: `act_${i + 1}`,
    actor: 'You',
    action: 'completed a prediction',
    target: `Risk assessment · ${Math.round(Number(row.risk_score))}% ${cap(row.risk_level)} risk`,
    icon: 'insights',
    color: RISK_COLORS[row.risk_level] || '#43A047',
    createdAt: new Date(row.created_at).toISOString(),
  }));

  if (activities.length < 5) {
    activities.push({
      id: 'act_system',
      actor: 'System',
      action: 'generated a health tip',
      target: 'Heart-healthy recommendations for you',
      icon: 'nightlight',
      color: '#43A047',
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    });
  }

  res.json({ success: true, message: 'Activities retrieved.', data: activities });
});

/** GET /api/dashboard/tips */
const getHealthTips = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Health tips retrieved.', data: HEALTH_TIPS });
});

module.exports = { getSummary, getNotifications, getActivities, getHealthTips };
