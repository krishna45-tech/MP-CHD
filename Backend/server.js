// =============================================================================
// CardioSight Express API gateway.
// =============================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

app.use(express.json());

// CORS – allow the Angular dev server (and any extra origins from .env).
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:4200")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', predictionRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', adminRoutes);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  let db = 'disconnected';
  try {
    await pool.query('SELECT 1');
    db = 'connected';
  } catch (err) {
    db = 'unavailable';
  }
  res.status(db === 'connected' ? 200 : 503).json({
    success: true,
    message: db === 'connected' ? 'OK' : 'Database unavailable',
    data: {
      status: 'up',
      database: db,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

// 404 for unknown routes
app.use(notFound);

// Central error handler (must be last)
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`CardioSight API listening on http://localhost:${PORT}`);
});

module.exports = { app, server };
