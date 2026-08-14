// =============================================================================
// Prediction & history controller.
// =============================================================================
const pool = require('../config/db');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const mlService = require('../services/mlService');

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const GENDERS = ['male', 'female'];
const SLEEP_DISORDERS = ['none', 'insomnia', 'sleep_apnea', 'narcolepsy'];
const ALCOHOL_LEVELS = ['none', 'light', 'moderate', 'heavy'];

const NUMBER_RANGES = {
  age: [1, 120],
  weightKg: [20, 400],
  heightCm: [80, 250],
  bmi: [10, 80],
  exerciseDaysPerWeek: [0, 7],
  stressLevel: [1, 5],
  systolicBp: [50, 250],
  diastolicBp: [30, 160],
  cholesterol: [50, 500],
  glucose: [40, 400],
  heartRate: [30, 220],
  sleepDurationHours: [1, 16],
  sleepQuality: [1, 5],
};

function isNumberInRange(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

/** Validates a PredictionInput body. Returns a normalized input or throws. */
function validatePredictionInput(body) {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Prediction input is required.');
  const input = { ...body };

  for (const [key, [min, max]] of Object.entries(NUMBER_RANGES)) {
    if (input[key] === undefined || !isNumberInRange(input[key], min, max)) {
      throw new HttpError(400, `Invalid ${key}: expected a number between ${min} and ${max}.`);
    }
  }

  if (!GENDERS.includes(input.gender)) throw new HttpError(400, "Invalid gender: expected 'male' or 'female'.");
  if (!SLEEP_DISORDERS.includes(input.sleepDisorder)) {
    throw new HttpError(400, "Invalid sleepDisorder: expected none, insomnia, sleep_apnea or narcolepsy.");
  }
  for (const flag of ['smoking', 'alcohol', 'snoring']) {
    if (typeof input[flag] !== 'boolean') throw new HttpError(400, `Invalid ${flag}: expected a boolean.`);
  }
  if (input.alcohol && input.alcoholLevel && !ALCOHOL_LEVELS.includes(input.alcoholLevel)) {
    throw new HttpError(400, 'Invalid alcoholLevel.');
  }
  if (input.smokingYears !== undefined && !isNumberInRange(input.smokingYears, 0, 90)) {
    throw new HttpError(400, 'Invalid smokingYears: expected a number between 0 and 90.');
  }
  if (input.diastolicBp >= input.systolicBp) {
    throw new HttpError(400, 'Diastolic blood pressure must be lower than systolic blood pressure.');
  }

  // Keep the payload to known fields only.
  const allowed = [
    'age', 'gender', 'weightKg', 'heightCm', 'bmi',
    'smoking', 'smokingYears', 'alcohol', 'alcoholLevel',
    'exerciseDaysPerWeek', 'stressLevel',
    'systolicBp', 'diastolicBp', 'cholesterol', 'glucose', 'heartRate',
    'sleepDurationHours', 'sleepQuality', 'sleepDisorder', 'snoring',
  ];
  const clean = {};
  for (const key of allowed) {
    if (input[key] !== undefined) clean[key] = input[key];
  }
  return clean;
}

// ---------------------------------------------------------------------------
// Serializers
// ---------------------------------------------------------------------------

/** DB row -> PredictionResult (POST /predict, GET /predict/:id). */
function serializeResult(row) {
  return {
    id: row.id,
    riskScore: Number(row.risk_score),
    riskLevel: row.risk_level,
    confidence: Number(row.confidence),
    diseaseProbability: Number(row.probability),
    recommendations: row.recommendations || [],
    contributingFactors: row.contributing_factors || [],
    input: row.input || {},
    submittedAt: new Date(row.created_at).toISOString(),
  };
}

/** DB row -> PredictionRecord (history list/item). */
function serializeRecord(row) {
  const input = row.input || {};
  return {
    id: row.id,
    patientId: row.user_id,
    patientName: `${row.first_name} ${row.last_name}`,
    age: input.age,
    gender: input.gender,
    riskScore: Number(row.risk_score),
    riskLevel: row.risk_level,
    confidence: Number(row.confidence),
    submittedAt: new Date(row.created_at).toISOString(),
    status: row.status,
    input,
  };
}

const RECORD_SELECT = `
  SELECT p.id, p.user_id, p.prediction, p.risk_level, p.risk_score, p.confidence,
         p.probability, p.status, p.input, p.recommendations, p.contributing_factors,
         p.created_at, u.first_name, u.last_name
    FROM predictions p
    JOIN users u ON u.id = p.user_id`;

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/** POST /api/predict */
const createPrediction = asyncHandler(async (req, res) => {
  const input = validatePredictionInput(req.body);

  // Phase 5: mlService.predict() will call the Django ML server instead.
  const result = await mlService.predict(input);

  // Resolve the patient row (auto-create if missing) for patient_id linkage.
  let patientId = null;
  const { rows: patientRows } = await pool.query(
    'SELECT id FROM patients WHERE user_id = $1',
    [req.user.id]
  );
  if (patientRows.length > 0) {
    patientId = patientRows[0].id;
  } else {
    const { rows: created } = await pool.query(
      'INSERT INTO patients (user_id) VALUES ($1) RETURNING id',
      [req.user.id]
    );
    patientId = created[0].id;
  }

  const { rows } = await pool.query(
    `INSERT INTO predictions
       (user_id, patient_id, prediction, risk_level, risk_score, confidence,
        probability, status, input, recommendations, contributing_factors)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', $8, $9, $10)
     RETURNING *`,
    [
      req.user.id,
      patientId,
      result.riskLevel,
      result.riskLevel,
      result.riskScore,
      result.confidence,
      result.diseaseProbability,
      JSON.stringify(input),
      JSON.stringify(result.recommendations),
      JSON.stringify(result.contributingFactors),
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Prediction completed.',
    data: serializeResult(rows[0]),
  });
});

/** GET /api/predict/:id */
const getPrediction = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM predictions WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  if (rows.length === 0) throw new HttpError(404, 'Prediction not found.');
  res.json({ success: true, message: 'Prediction retrieved.', data: serializeResult(rows[0]) });
});

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/** GET /api/history */
const listHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 10));
  const search = String(req.query.search || '').trim();
  const risk = String(req.query.risk || 'all');
  const sortBy = String(req.query.sortBy || 'submittedAt');
  const sortDir = String(req.query.sortDir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const conditions = ['p.user_id = $1'];
  const values = [req.user.id];

  if (search) {
    conditions.push(
      `(p.id::text ILIKE $${values.length + 1} OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${values.length + 1} OR
        p.risk_score::text ILIKE $${values.length + 1})`
    );
    values.push(`%${search}%`);
  }
  if (risk && risk !== 'all') {
    conditions.push(`p.risk_level = $${values.length + 1}`);
    values.push(risk);
  }

  // Whitelisted sortable columns only.
  const sortColumns = {
    submittedAt: 'p.created_at',
    riskScore: 'p.risk_score',
    age: "(p.input->>'age')::int",
    confidence: 'p.confidence',
  };
  const orderBy = sortColumns[sortBy] || sortColumns.submittedAt;
  const where = `WHERE ${conditions.join(' AND ')}`;

  const countValues = [...values];
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM predictions p JOIN users u ON u.id = p.user_id ${where}`,
    countValues
  );
  const total = countRows[0].total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  const { rows } = await pool.query(
    `${RECORD_SELECT} ${where} ORDER BY ${orderBy} ${sortDir} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pageSize, offset]
  );

  res.json({
    success: true,
    message: 'History retrieved.',
    data: {
      items: rows.map(serializeRecord),
      total,
      page: safePage,
      pageSize,
      totalPages,
    },
  });
});

/** GET /api/history/:id */
const getHistoryItem = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `${RECORD_SELECT} WHERE p.id = $1 AND p.user_id = $2`,
    [req.params.id, req.user.id]
  );
  if (rows.length === 0) throw new HttpError(404, 'Prediction not found.');
  res.json({ success: true, message: 'Prediction retrieved.', data: serializeRecord(rows[0]) });
});

/** DELETE /api/history/:id */
const deleteHistoryItem = asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM predictions WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  if (rowCount === 0) throw new HttpError(404, 'Prediction not found.');
  res.json({ success: true, message: 'Prediction record deleted.', data: { message: 'Prediction record deleted.' } });
});

module.exports = {
  createPrediction,
  getPrediction,
  listHistory,
  getHistoryItem,
  deleteHistoryItem,
  serializeResult,
  serializeRecord,
  RECORD_SELECT,
};
