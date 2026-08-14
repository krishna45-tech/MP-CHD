// =============================================================================
// Analytics controller – platform-wide chart data.
// =============================================================================
const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AGE_BUCKETS = [
  { range: '18-30', min: 18, max: 30 },
  { range: '31-40', min: 31, max: 40 },
  { range: '41-50', min: 41, max: 50 },
  { range: '51-60', min: 51, max: 60 },
  { range: '60+', min: 61, max: 999 },
];

/** GET /api/analytics */
const getAnalytics = asyncHandler(async (req, res) => {
  const { rows: preds } = await pool.query(
    `SELECT risk_level, risk_score, input, created_at FROM predictions`
  );
  const { rows: userCount } = await pool.query('SELECT COUNT(*)::int AS c FROM users');

  const total = preds.length;
  const high = preds.filter((r) => r.risk_level === 'high').length;
  const medium = preds.filter((r) => r.risk_level === 'medium').length;
  const low = total - high - medium;
  const avgRisk = total ? Math.round(preds.reduce((s, r) => s + Number(r.risk_score), 0) / total) : 0;

  const male = preds.filter((r) => (r.input || {}).gender === 'male').length;

  const ageDistribution = AGE_BUCKETS.map((b) => {
    const inRange = preds.filter((r) => {
      const age = (r.input || {}).age;
      return age != null && age >= b.min && age <= b.max;
    });
    return {
      range: b.range,
      total: inRange.length,
      highRisk: inRange.filter((r) => r.risk_level === 'high').length,
    };
  });

  const monthlyKeys = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    monthlyKeys.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, month: MONTHS[d.getMonth()] });
  }
  const monthlyPredictions = monthlyKeys.map(({ key, month }) => {
    const monthRecords = preds.filter((r) => new Date(r.created_at).toISOString().startsWith(key));
    return {
      month,
      predictions: monthRecords.length,
      highRisk: monthRecords.filter((r) => r.risk_level === 'high').length,
    };
  });

  res.json({
    success: true,
    message: 'Analytics retrieved.',
    data: {
      totalPredictions: total,
      totalUsers: userCount[0].c,
      avgRiskScore: avgRisk,
      highRiskRate: total ? Math.round((high / total) * 100) : 0,
      riskDistribution: [
        { label: 'Low risk', value: low, color: '#43A047' },
        { label: 'Medium risk', value: medium, color: '#F9A825' },
        { label: 'High risk', value: high, color: '#E53935' },
      ],
      genderDistribution: [
        { label: 'Male', value: male },
        { label: 'Female', value: total - male },
      ],
      ageDistribution,
      monthlyPredictions,
    },
  });
});

module.exports = { getAnalytics };
