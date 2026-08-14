// =============================================================================
// ML communication service.
//
// Sends the validated PredictionInput to the Django ML server (scikit-learn)
// via axios, and maps its response back to the shape the controllers expect.
// If the ML server is unreachable, falls back to a deterministic local scoring
// (mirroring the Angular mock) so the API stays functional during development.
// =============================================================================
const axios = require('axios');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const ML_URL = (process.env.ML_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');
const ML_PREDICT_URL = `${ML_URL}/api/predict`;

// ---------------------------------------------------------------------------
// Heuristic factor & recommendation builders (shared by both paths).
// ---------------------------------------------------------------------------

function buildFactors(input) {
  const factors = [];
  let score = 8;

  const addFactor = (factor, contribution, severity, label, detail) => {
    if (Math.abs(contribution) < 0.4) return;
    score += contribution;
    factors.push({ factor, impact: clamp(contribution, -1, 1), severity, label, detail });
  };

  const severityOf = {
    age: (v) => (v > 55 ? 'high' : v > 45 ? 'medium' : 'low'),
    stress: (v) => (v >= 4 ? 'high' : 'low'),
    exercise: (v) => (v < 2 ? 'high' : 'low'),
    bp: (v) => (v > 145 ? 'high' : 'medium'),
    cholesterol: (v) => (v > 240 ? 'high' : 'medium'),
    glucose: (v) => (v > 140 ? 'high' : 'medium'),
    bmi: (v) => (v > 30 ? 'high' : 'medium'),
  };

  addFactor('Age', (input.age - 35) / 18, severityOf.age(input.age), 'Age', `${input.age} years`);
  if (input.smoking) addFactor('Smoking', 10, 'high', 'Smoking', 'Tobacco use raises CVD risk substantially');
  if (input.snoring) addFactor('Snoring', 5, 'medium', 'Snoring', 'Frequent snoring correlates with sleep apnea');
  addFactor('Stress', (input.stressLevel - 3) * 2.2, severityOf.stress(input.stressLevel), 'Stress', `Level ${input.stressLevel}/5`);
  addFactor('Exercise', (1 - input.exerciseDaysPerWeek / 7) * 7, severityOf.exercise(input.exerciseDaysPerWeek), 'Physical activity', `${input.exerciseDaysPerWeek} days/week`);
  if (input.systolicBp > 130) addFactor('Blood pressure', (input.systolicBp - 120) / 12, severityOf.bp(input.systolicBp), 'Systolic BP', `${input.systolicBp} mmHg`);
  if (input.cholesterol > 200) addFactor('Cholesterol', (input.cholesterol - 190) / 14, severityOf.cholesterol(input.cholesterol), 'Total cholesterol', `${input.cholesterol} mg/dL`);
  if (input.glucose > 110) addFactor('Blood glucose', (input.glucose - 100) / 12, severityOf.glucose(input.glucose), 'Fasting glucose', `${input.glucose} mg/dL`);
  if (input.bmi > 25) addFactor('BMI', (input.bmi - 23) / 3, severityOf.bmi(input.bmi), 'Body mass index', `${Number(input.bmi).toFixed(1)}`);
  if (input.sleepDurationHours < 6 || input.sleepDurationHours > 9)
    addFactor('Sleep duration', input.sleepDurationHours < 6 ? 6 : 3, 'medium', 'Sleep duration', `${input.sleepDurationHours}h/night`);
  if (input.sleepQuality <= 2) addFactor('Sleep quality', 4, 'medium', 'Sleep quality', `Rated ${input.sleepQuality}/5`);
  if (input.sleepDisorder !== 'none') addFactor('Sleep disorder', 9, 'high', 'Sleep disorder', input.sleepDisorder.replace('_', ' '));
  if (input.alcohol) addFactor('Alcohol', 3, 'low', 'Alcohol', 'Regular alcohol consumption');

  return { score: clamp(Math.round(score), 2, 97), factors: factors.slice(0, 6) };
}

function buildRecommendations(input, level) {
  const recommendations = [];
  if (level === 'high') {
    recommendations.push('Consult a cardiologist within the next two weeks for a full cardiac evaluation.');
    recommendations.push('Begin a doctor-supervised plan to manage blood pressure and lipid levels.');
  } else if (level === 'medium') {
    recommendations.push('Schedule a preventive cardiovascular check-up with your primary physician.');
  }
  recommendations.push('Perform 150 minutes of moderate aerobic exercise every week (brisk walking, cycling, swimming).');
  recommendations.push('Follow a heart-healthy DASH-style diet rich in vegetables, whole grains, and omega-3s.');
  if (input.smoking) recommendations.push('Quit smoking – enrol in a cessation program; risk drops sharply within 1 year.');
  if (input.sleepDurationHours < 6 || input.sleepQuality <= 2)
    recommendations.push('Aim for 7–9 hours of quality sleep; address sleep apnea with a sleep study if snoring is frequent.');
  if (input.stressLevel >= 4) recommendations.push('Practice 10 minutes of mindfulness or deep-breathing daily to reduce stress.');
  recommendations.push('Monitor blood pressure at home twice a week and log readings before each check-up.');
  if (input.cholesterol > 200) recommendations.push('Review your lipid profile every 6 months; consider plant sterols and dietary fibre.');
  if (input.glucose > 110) recommendations.push('Keep fasting glucose below 100 mg/dL with balanced meals and regular physical activity.');
  return [...new Set(recommendations)].slice(0, 6);
}

// ---------------------------------------------------------------------------
// Deterministic fallback scoring (used only if the ML server is unreachable).
// ---------------------------------------------------------------------------
function computeRisk(input) {
  const { score, factors } = buildFactors(input);
  const level = score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low';
  const confidence = clamp(Math.round(84 + (input.systolicBp % 13) - (input.stressLevel * 2)), 76, 96);
  return {
    score,
    confidence,
    level,
    factors,
    recommendations: buildRecommendations(input, level),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Runs a prediction for the given validated PredictionInput.
 * Returns { riskScore, riskLevel, confidence, diseaseProbability,
 *           recommendations, contributingFactors }.
 */
async function predict(input) {
  try {
    const { data } = await axios.post(ML_PREDICT_URL, { features: input }, { timeout: 15000 });
    if (!data || data.success !== true) {
      throw new Error('ML server returned an invalid response.');
    }
    return {
      riskScore: Math.round(data.risk_score),
      riskLevel: data.prediction,
      confidence: Math.round(data.confidence),
      diseaseProbability: Math.round(data.probability),
      recommendations: buildRecommendations(input, data.prediction),
      contributingFactors: buildFactors(input).factors,
    };
  } catch (err) {
    console.error(`[mlService] ML server unreachable at ${ML_PREDICT_URL} – using local fallback:`, err.message);
    const { score, confidence, level, factors, recommendations } = computeRisk(input);
    return {
      riskScore: score,
      riskLevel: level,
      confidence,
      diseaseProbability: clamp(score + 3, 3, 99),
      recommendations,
      contributingFactors: factors,
    };
  }
}

module.exports = { predict };
