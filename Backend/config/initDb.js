// =============================================================================
// Applies config/schema.sql to the database. Run via: npm run db:init
// =============================================================================
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Database schema applied successfully.');
  await pool.end();
}

main().catch((err) => {
  console.error('Failed to apply database schema:', err.message);
  process.exit(1);
});
