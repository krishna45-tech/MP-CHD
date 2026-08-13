// =============================================================================
// Prediction domain models.
// =============================================================================
import type { RiskLevel } from './common.model';

export type Gender = 'male' | 'female';
export type SleepDisorder = 'none' | 'insomnia' | 'sleep_apnea' | 'narcolepsy';

/** Raw inputs collected by the multi-step prediction form. */
export interface PredictionInput {
  // Personal
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
  bmi: number;

  // Lifestyle
  smoking: boolean;
  smokingYears?: number;
  alcohol: boolean;
  alcoholLevel?: 'none' | 'light' | 'moderate' | 'heavy';
  exerciseDaysPerWeek: number;
  stressLevel: 1 | 2 | 3 | 4 | 5;

  // Clinical
  systolicBp: number;
  diastolicBp: number;
  cholesterol: number;
  glucose: number;
  heartRate: number;

  // Sleep
  sleepDurationHours: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  sleepDisorder: SleepDisorder;
  snoring: boolean;
}

/** Contribution of a single feature toward the final prediction. */
export interface FactorContribution {
  factor: string;
  impact: number; // -1 .. 1 (positive = pushes risk up)
  severity: 'low' | 'medium' | 'high';
  label: string;
  detail: string;
}

/** Full prediction output returned by the ML engine. */
export interface PredictionResult {
  id: string;
  riskScore: number; // 0 .. 100
  riskLevel: RiskLevel;
  confidence: number; // 0 .. 100 (%)
  diseaseProbability: number; // 0 .. 100 (%)
  recommendations: string[];
  contributingFactors: FactorContribution[];
  input: PredictionInput;
  submittedAt: string;
}

/** Row shown in the history table. */
export interface PredictionRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: Gender;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  submittedAt: string;
  status: 'completed' | 'processing' | 'failed';
  input: PredictionInput;
}
