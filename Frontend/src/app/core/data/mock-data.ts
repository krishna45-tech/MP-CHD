// =============================================================================
// Dummy data used when `environment.useMock === true`.
// Mirrors the shape of the real backend responses so the UI is fully
// functional during development and demos.
// =============================================================================
import type { User } from '../models/user.model';
import type {
  PredictionRecord,
  PredictionResult,
  PredictionInput,
  FactorContribution,
  SleepDisorder,
  Gender,
} from '../models/prediction.model';
import type { RiskLevel } from '../models/common.model';
import type {
  AppNotification,
  HealthTip,
  ActivityEvent,
  HealthMetric,
} from '../models/health.model';

export const MOCK_USER: User = {
  id: 'usr_001',
  firstName: 'Aarav',
  lastName: 'Sharma',
  email: 'aarav.sharma@demo.com',
  phone: '+91 98765 43210',
  role: 'patient',
  avatarColor: '#E53935',
  gender: 'male',
  dateOfBirth: '1988-04-15',
  heightCm: 172,
  weightKg: 78,
  bloodGroup: 'B+',
  allergies: ['Penicillin'],
  medications: ['Metformin 500mg', 'Atorvastatin 10mg'],
  medicalConditions: ['Type 2 Diabetes', 'Mild Hypertension'],
  isEmailVerified: true,
  createdAt: '2025-01-12T10:24:00.000Z',
};

export const MOCK_ADMIN: User = {
  id: 'usr_000',
  firstName: 'Dr. Meera',
  lastName: 'Nair',
  email: 'admin@cardiosight.demo',
  phone: '+91 90000 00001',
  role: 'admin',
  avatarColor: '#1565C0',
  gender: 'female',
  dateOfBirth: '1982-09-02',
  heightCm: 165,
  weightKg: 62,
  bloodGroup: 'A+',
  allergies: [],
  medications: [],
  medicalConditions: [],
  isEmailVerified: true,
  createdAt: '2024-11-02T09:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const pick = <T,>(arr: T[], seed: number): T =>
  arr[Math.abs(seed) % arr.length];

const patients: Array<Pick<User, 'firstName' | 'lastName' | 'gender'>> = [
  { firstName: 'Rohan', lastName: 'Verma', gender: 'male' },
  { firstName: 'Priya', lastName: 'Singh', gender: 'female' },
  { firstName: 'Arjun', lastName: 'Reddy', gender: 'male' },
  { firstName: 'Sneha', lastName: 'Iyer', gender: 'female' },
  { firstName: 'Vikram', lastName: 'Malhotra', gender: 'male' },
  { firstName: 'Ananya', lastName: 'Gupta', gender: 'female' },
  { firstName: 'Karan', lastName: 'Kapoor', gender: 'male' },
  { firstName: 'Divya', lastName: 'Menon', gender: 'female' },
  { firstName: 'Aditya', lastName: 'Joshi', gender: 'male' },
  { firstName: 'Ishita', lastName: 'Kulkarni', gender: 'female' },
  { firstName: 'Sanjay', lastName: 'Patel', gender: 'male' },
  { firstName: 'Neha', lastName: 'Desai', gender: 'female' },
];

const firstNames: string[] = patients.map((p) => p.firstName);
const lastNames: string[] = patients.map((p) => p.lastName);

const firstNamesSet = [
  'Aarav', 'Ananya', 'Vihaan', 'Diya', 'Kabir', 'Myra', 'Reyansh', 'Ishita',
  'Ayaan', 'Saanvi', 'Arjun', 'Aditi', 'Vivaan', 'Pari', 'Krishna', 'Navya',
  'Aryan', 'Anika', 'Shaurya', 'Riya',
];

// ---------------------------------------------------------------------------
// Prediction record generator (deterministic for a given index)
// ---------------------------------------------------------------------------
function buildInput(seed: number): PredictionInput {
  const gender: Gender = seed % 2 === 0 ? 'male' : 'female';
  const age = 32 + (seed * 7) % 46;
  const weightKg = 55 + (seed * 13) % 45;
  const heightCm = 150 + (seed * 9) % 34;
  const bmi = clamp(weightKg / Math.pow(heightCm / 100, 2), 18, 42);
  const sleepDisorders: SleepDisorder[] = ['none', 'insomnia', 'sleep_apnea', 'none', 'sleep_apnea'];
  return {
    age,
    gender,
    weightKg,
    heightCm,
    bmi: Math.round(bmi * 10) / 10,
    smoking: seed % 5 === 0,
    alcohol: seed % 4 === 0,
    exerciseDaysPerWeek: (seed * 3) % 7,
    stressLevel: clamp((seed % 5) + 1, 1, 5) as 1 | 2 | 3 | 4 | 5,
    systolicBp: 110 + (seed * 11) % 60,
    diastolicBp: 70 + (seed * 7) % 35,
    cholesterol: 140 + (seed * 13) % 130,
    glucose: 85 + (seed * 11) % 75,
    heartRate: 60 + (seed * 9) % 45,
    sleepDurationHours: Math.round((5 + (seed * 11) % 40) / 10),
    sleepQuality: clamp((seed % 5) + 1, 1, 5) as 1 | 2 | 3 | 4 | 5,
    sleepDisorder: pick(sleepDisorders, seed),
    snoring: seed % 3 === 0,
  };
}

/** Mock clinical scoring used only for offline demos. */
export function computeMockRisk(input: PredictionInput): {
  score: number;
  confidence: number;
  level: RiskLevel;
  factors: FactorContribution[];
  recommendations: string[];
} {
  const factors: FactorContribution[] = [];
  let score = 8;

  const addFactor = (
    factor: string,
    contribution: number,
    severity: 'low' | 'medium' | 'high',
    label: string,
    detail: string,
  ) => {
    if (Math.abs(contribution) < 0.4) return;
    score += contribution;
    factors.push({ factor, impact: clamp(contribution, -1, 1), severity, label, detail });
  };

  addFactor('Age', (input.age - 35) / 18, input.age > 55 ? 'high' : input.age > 45 ? 'medium' : 'low', 'Age', `${input.age} years`);
  if (input.smoking) addFactor('Smoking', 10, 'high', 'Smoking', 'Tobacco use raises CVD risk substantially');
  if (input.snoring) addFactor('Snoring', 5, 'medium', 'Snoring', 'Frequent snoring correlates with sleep apnea');
  addFactor('Stress', (input.stressLevel - 3) * 2.2, input.stressLevel >= 4 ? 'high' : 'low', 'Stress', `Level ${input.stressLevel}/5`);
  addFactor('Exercise', (1 - input.exerciseDaysPerWeek / 7) * 7, input.exerciseDaysPerWeek < 2 ? 'high' : 'low', 'Physical activity', `${input.exerciseDaysPerWeek} days/week`);
  if (input.systolicBp > 130) addFactor('Blood pressure', (input.systolicBp - 120) / 12, input.systolicBp > 145 ? 'high' : 'medium', 'Systolic BP', `${input.systolicBp} mmHg`);
  if (input.cholesterol > 200) addFactor('Cholesterol', (input.cholesterol - 190) / 14, input.cholesterol > 240 ? 'high' : 'medium', 'Total cholesterol', `${input.cholesterol} mg/dL`);
  if (input.glucose > 110) addFactor('Blood glucose', (input.glucose - 100) / 12, input.glucose > 140 ? 'high' : 'medium', 'Fasting glucose', `${input.glucose} mg/dL`);
  if (input.bmi > 25) addFactor('BMI', (input.bmi - 23) / 3, input.bmi > 30 ? 'high' : 'medium', 'Body mass index', `${input.bmi.toFixed(1)}`);
  if (input.sleepDurationHours < 6 || input.sleepDurationHours > 9)
    addFactor('Sleep duration', input.sleepDurationHours < 6 ? 6 : 3, 'medium', 'Sleep duration', `${input.sleepDurationHours}h/night`);
  if (input.sleepQuality <= 2) addFactor('Sleep quality', 4, 'medium', 'Sleep quality', `Rated ${input.sleepQuality}/5`);
  if (input.sleepDisorder !== 'none') addFactor('Sleep disorder', 9, 'high', 'Sleep disorder', input.sleepDisorder.replace('_', ' '));
  if (input.alcohol) addFactor('Alcohol', 3, 'low', 'Alcohol', 'Regular alcohol consumption');

  score = clamp(Math.round(score), 2, 97);
  const level: RiskLevel = score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low';
  const confidence = clamp(Math.round(84 + (input.systolicBp % 13) - (input.stressLevel * 2)), 76, 96);

  const recommendations: string[] = [];
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

  return {
    score,
    confidence,
    level,
    factors: factors.slice(0, 6),
    recommendations: [...new Set(recommendations)].slice(0, 6),
  };
}

function buildRecord(seed: number): PredictionRecord {
  const input = buildInput(seed);
  const { score, confidence, level } = computeMockRisk(input);
  const patient = patients[seed % patients.length];
  const date = new Date(Date.UTC(2026, 2 + (seed % 5), 1 + (seed % 27), 10 + (seed % 8), (seed * 7) % 60));
  return {
    id: `prd_${String(seed + 1).padStart(3, '0')}`,
    patientId: `usr_${String(seed + 2).padStart(3, '0')}`,
    patientName: `${patient.firstName} ${patient.lastName}`,
    age: input.age,
    gender: input.gender,
    riskScore: score,
    riskLevel: level,
    confidence,
    submittedAt: date.toISOString(),
    status: 'completed',
    input,
  };
}

/** Master list used for history, dashboard "recent", and analytics. */
export const MOCK_PREDICTIONS: PredictionRecord[] = Array.from(
  { length: 34 },
  (_, i) => buildRecord(i),
);

/** Deterministic prediction "result" generated at predict time. */
export function mockPredictionResult(input: PredictionInput): PredictionResult {
  const { score, confidence, level, factors, recommendations } = computeMockRisk(input);
  return {
    id: `prd_${Date.now().toString(36)}`,
    riskScore: score,
    riskLevel: level,
    confidence,
    diseaseProbability: clamp(score + 3, 3, 99),
    recommendations,
    contributingFactors: factors,
    input,
    submittedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Notifications / tips / activities
// ---------------------------------------------------------------------------
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ntf_1',
    title: 'New prediction available',
    message: 'Your latest cardiac risk assessment has been completed.',
    type: 'success',
    icon: 'insights',
    createdAt: '2026-08-06T09:30:00.000Z',
    read: false,
  },
  {
    id: 'ntf_2',
    title: 'Weekly health report',
    message: 'Your weekly report is ready – your resting heart rate improved 4% this week.',
    type: 'info',
    icon: 'schedule',
    createdAt: '2026-08-05T18:00:00.000Z',
    read: false,
  },
  {
    id: 'ntf_3',
    title: 'Risk level changed',
    message: 'Your risk level moved from Medium to Low after your latest assessment.',
    type: 'success',
    icon: 'favorite',
    createdAt: '2026-08-03T11:15:00.000Z',
    read: true,
  },
  {
    id: 'ntf_4',
    title: 'Check-up reminder',
    message: 'Book your cardiology follow-up to keep your profile up to date.',
    type: 'warning',
    icon: 'warning',
    createdAt: '2026-07-30T08:45:00.000Z',
    read: true,
  },
  {
    id: 'ntf_5',
    title: 'Profile incomplete',
    message: 'Add your latest blood-pressure reading to improve prediction accuracy.',
    type: 'info',
    icon: 'insights',
    createdAt: '2026-07-28T14:20:00.000Z',
    read: true,
  },
];

export const MOCK_HEALTH_TIPS: HealthTip[] = [
  {
    id: 'tip_1',
    title: 'Sleep first',
    body: 'Adults who sleep 7–9 hours have up to 40% lower heart disease risk than short sleepers.',
    icon: 'nightlight',
    tag: 'Sleep',
  },
  {
    id: 'tip_2',
    title: 'Move daily',
    body: 'Just 30 minutes of brisk walking daily can lower blood pressure and LDL cholesterol.',
    icon: 'directions_walk',
    tag: 'Exercise',
  },
  {
    id: 'tip_3',
    title: 'De-stress',
    body: 'Chronic stress raises cortisol and heart rate. Try 10 minutes of deep breathing.',
    icon: 'spa',
    tag: 'Mindfulness',
  },
  {
    id: 'tip_4',
    title: 'Know your numbers',
    body: 'Healthy targets: BP < 120/80, LDL < 100, fasting glucose < 100 mg/dL.',
    icon: 'monitor_heart',
    tag: 'Metrics',
  },
  {
    id: 'tip_5',
    title: 'Eat the rainbow',
    body: 'A DASH-style diet with 5 servings of vegetables daily cuts CVD risk by ~15%.',
    icon: 'restaurant',
    tag: 'Nutrition',
  },
];

export const MOCK_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act_1',
    actor: 'You',
    action: 'completed a prediction',
    target: 'Risk assessment · 28% Low risk',
    icon: 'insights',
    color: '#43A047',
    createdAt: '2026-08-06T09:31:00.000Z',
  },
  {
    id: 'act_2',
    actor: 'System',
    action: 'published a weekly report',
    target: 'Heart health snapshot for Jul 31 – Aug 6',
    icon: 'summarize',
    color: '#1565C0',
    createdAt: '2026-08-05T18:05:00.000Z',
  },
  {
    id: 'act_3',
    actor: 'You',
    action: 'updated your profile',
    target: 'Blood pressure target updated',
    icon: 'manage_accounts',
    color: '#E53935',
    createdAt: '2026-08-04T12:40:00.000Z',
  },
  {
    id: 'act_4',
    actor: 'System',
    action: 'generated a health tip',
    target: 'Sleep-first recommendation for you',
    icon: 'nightlight',
    color: '#43A047',
    createdAt: '2026-08-02T07:00:00.000Z',
  },
  {
    id: 'act_5',
    actor: 'You',
    action: 'completed a prediction',
    target: 'Risk assessment · 52% Medium risk',
    icon: 'insights',
    color: '#F9A825',
    createdAt: '2026-07-28T10:12:00.000Z',
  },
];

export const MOCK_DASHBOARD_METRICS: HealthMetric[] = [
  { key: 'systolicBp', label: 'Blood pressure', value: 122, unit: 'mmHg', goodRange: [90, 130], status: 'good' },
  { key: 'heartRate', label: 'Resting heart rate', value: 72, unit: 'bpm', goodRange: [60, 100], status: 'good' },
  { key: 'cholesterol', label: 'Total cholesterol', value: 198, unit: 'mg/dL', goodRange: [125, 200], status: 'warning' },
  { key: 'glucose', label: 'Fasting glucose', value: 96, unit: 'mg/dL', goodRange: [70, 100], status: 'good' },
];

export const MOCK_USERS: User[] = [
  MOCK_ADMIN,
  MOCK_USER,
  ...Array.from({ length: 12 }, (_, i) => {
    const gender = i % 2 === 0 ? 'male' : 'female';
    return {
      id: `usr_${String(i + 2).padStart(3, '0')}`,
      firstName: firstNamesSet[(i * 3 + 1) % firstNamesSet.length],
      lastName: lastNames[(i * 5 + 2) % lastNames.length],
      email: `${firstNamesSet[(i * 3 + 1) % firstNamesSet.length].toLowerCase()}.${lastNames[(i * 5 + 2) % lastNames.length].toLowerCase()}@demo.com`,
      phone: `+91 9${(100000000 + i * 1379137) % 999999999}`,
      role: 'patient' as const,
      avatarColor: ['#E53935', '#1565C0', '#43A047', '#F9A825', '#7B1FA2', '#00897B'][i % 6],
      gender: gender as 'male' | 'female',
      dateOfBirth: `198${i % 9}-0${(i % 9) + 1}-1${i % 9}`,
      heightCm: 155 + (i * 7) % 30,
      weightKg: 52 + (i * 11) % 42,
      bloodGroup: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+'][i % 7],
      allergies: i % 4 === 0 ? ['Penicillin'] : [],
      medications: i % 3 === 0 ? ['Amlodipine 5mg'] : [],
      medicalConditions: i % 4 === 0 ? ['Hypertension'] : [],
      isEmailVerified: i % 6 !== 0,
      createdAt: new Date(Date.UTC(2025, (i % 10), 3 + i)).toISOString(),
    } satisfies User;
  }),
];

export const MOCK_ADMIN_ACTIVITIES = [
  {
    id: 'adm_act_1',
    user: 'Rohan Verma',
    role: 'patient',
    action: 'submitted a prediction',
    target: 'Risk assessment · High',
    icon: 'insights',
    createdAt: '2026-08-06T10:15:00.000Z',
  },
  {
    id: 'adm_act_2',
    user: 'Dr. Meera Nair',
    role: 'admin',
    action: 'updated risk model',
    target: 'ML model v2.4.1 deployed',
    icon: 'model_training',
    createdAt: '2026-08-06T08:40:00.000Z',
  },
  {
    id: 'adm_act_3',
    user: 'Priya Singh',
    role: 'patient',
    action: 'registered an account',
    target: 'New patient onboarded',
    icon: 'person_add',
    createdAt: '2026-08-05T16:22:00.000Z',
  },
  {
    id: 'adm_act_4',
    user: 'System',
    role: 'system',
    action: 'ran weekly analytics',
    target: '34 predictions this week',
    icon: 'query_stats',
    createdAt: '2026-08-05T09:00:00.000Z',
  },
  {
    id: 'adm_act_5',
    user: 'Arjun Reddy',
    role: 'patient',
    action: 'downloaded PDF report',
    target: 'Prediction #029 report',
    icon: 'picture_as_pdf',
    createdAt: '2026-08-04T13:11:00.000Z',
  },
];
