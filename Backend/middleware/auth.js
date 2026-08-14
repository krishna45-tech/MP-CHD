// =============================================================================
// JWT authentication middleware. Attaches the authenticated user to req.user.
// =============================================================================
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    if (!payload.sub) {
      return res.status(401).json({ success: false, message: 'Invalid token payload.' });
    }

    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, role, is_email_verified
         FROM users
        WHERE id = $1`,
      [payload.sub]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };
