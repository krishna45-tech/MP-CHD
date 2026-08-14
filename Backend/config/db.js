// =============================================================================
// PostgreSQL connection pool.
// Supports either a single DATABASE_URL or individual PG* settings from .env.
// =============================================================================
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'postgres',
      }
);

pool.on('error', (err) => {
  // Prevents the process from crashing on idle client errors.
  console.error('Unexpected error on idle PostgreSQL client', err.message);
});

module.exports = pool;
