// =============================================================================
// Seeds a default admin account. Run via: npm run db:seed
// Credentials come from .env (ADMIN_EMAIL / ADMIN_PASSWORD) with dev defaults.
// =============================================================================
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@cardiosight.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role, is_email_verified, avatar_color)
     VALUES ('Cardio', 'Admin', $1, $2, 'admin', TRUE, '#1565C0')
     ON CONFLICT (email) DO UPDATE SET role = 'admin', is_email_verified = TRUE
     RETURNING id, email, role`,
    [email, await bcrypt.hash(password, 10)]
  );
  await pool.query(
    'INSERT INTO patients (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
    [rows[0].id]
  );

  console.log(`Admin ready: ${rows[0].email} (password: ${password})`);
  await pool.end();
}

main().catch((err) => {
  console.error('Failed to seed admin:', err.message);
  process.exit(1);
});
