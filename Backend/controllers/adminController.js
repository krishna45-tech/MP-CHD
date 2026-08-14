// =============================================================================
// Admin controller – platform stats, user management, activity feed.
// All routes are protected by requireRole('admin').
// =============================================================================
const pool = require('../config/db');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { serializeUser } = require('./authController');

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** GET /api/admin/stats */
const getStats = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM users) AS total_users,
       (SELECT COUNT(*)::int FROM users WHERE role = 'patient') AS patients,
       (SELECT COUNT(*)::int FROM users WHERE role = 'admin') AS admins,
       (SELECT COUNT(*)::int FROM predictions) AS total_predictions,
       (SELECT COUNT(*)::int FROM predictions WHERE created_at >= now() - interval '7 days') AS predictions_this_week,
       (SELECT COUNT(*)::int FROM predictions WHERE risk_level = 'high') AS high_risk_predictions,
       (SELECT COALESCE(ROUND(AVG(risk_score)), 0)::int FROM predictions) AS avg_risk_score,
       (SELECT COUNT(*)::int FROM users WHERE created_at >= date_trunc('month', now())) AS new_users_this_month`
  );
  const s = rows[0];
  res.json({
    success: true,
    message: 'Admin stats retrieved.',
    data: {
      totalUsers: s.total_users,
      patients: s.patients,
      admins: s.admins,
      totalPredictions: s.total_predictions,
      predictionsThisWeek: s.predictions_this_week,
      highRiskPredictions: s.high_risk_predictions,
      avgRiskScore: s.avg_risk_score,
      newUsersThisMonth: s.new_users_this_month,
    },
  });
});

/** GET /api/admin/users?search= */
const getUsers = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();

  const { rows } = await pool.query(
    `SELECT u.*,
            COUNT(p.id)::int AS predictions_count,
            COALESCE(MAX(p.created_at), u.created_at) AS last_active_at
       FROM users u
       LEFT JOIN predictions p ON p.user_id = u.id
      WHERE $1 = '' OR CONCAT(u.first_name, ' ', u.last_name) ILIKE $1 OR u.email ILIKE $1
      GROUP BY u.id
      ORDER BY u.created_at DESC`,
    [`%${search}%`]
  );

  const now = Date.now();
  const sevenDays = 7 * 24 * 3600 * 1000;

  const data = rows.map((row) => {
    const lastActive = new Date(row.last_active_at).getTime();
    const status = now - lastActive <= sevenDays ? 'active' : row.is_email_verified ? 'inactive' : 'inactive';
    return {
      ...serializeUser(row),
      predictionsCount: row.predictions_count,
      lastActiveAt: new Date(row.last_active_at).toISOString(),
      status,
    };
  });

  res.json({ success: true, message: 'Users retrieved.', data });
});

/** DELETE /api/admin/users/:id */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    throw new HttpError(400, 'You cannot delete your own account.');
  }

  const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
  if (rows.length === 0) throw new HttpError(404, 'User not found.');
  if (rows[0].role === 'admin') {
    throw new HttpError(403, 'Admin accounts cannot be deleted.');
  }

  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  res.json({ success: true, message: 'User account removed.', data: { message: 'User account removed.' } });
});

/** GET /api/admin/activities */
const getActivities = asyncHandler(async (req, res) => {
  const { rows: preds } = await pool.query(
    `SELECT p.risk_level, p.risk_score, p.created_at, u.first_name, u.last_name
       FROM predictions p JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
      LIMIT 5`
  );
  const { rows: newUsers } = await pool.query(
    `SELECT first_name, last_name, created_at FROM users ORDER BY created_at DESC LIMIT 3`
  );

  const activities = [];

  preds.forEach((p, i) => {
    activities.push({
      id: `adm_act_pred_${i}`,
      user: `${p.first_name} ${p.last_name}`,
      role: 'patient',
      action: 'submitted a prediction',
      target: `Risk assessment · ${cap(p.risk_level)}`,
      icon: 'insights',
      createdAt: new Date(p.created_at).toISOString(),
    });
  });

  newUsers.forEach((u, i) => {
    activities.push({
      id: `adm_act_user_${i}`,
      user: `${u.first_name} ${u.last_name}`,
      role: 'patient',
      action: 'registered an account',
      target: 'New patient onboarded',
      icon: 'person_add',
      createdAt: new Date(u.created_at).toISOString(),
    });
  });

  activities.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ success: true, message: 'Activities retrieved.', data: activities.slice(0, 10) });
});

module.exports = { getStats, getUsers, deleteUser, getActivities };
