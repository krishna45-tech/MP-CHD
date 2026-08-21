// =============================================================================
// Prediction domain models.
// =============================================================================

import type { RiskLevel } from "./common.model";

/** Raw Framingham inputs collected by the prediction form. */
export interface PredictionInput {
  // Personal
  male: 0 | 1;
  age: number;
  education: 1 | 2 | 3 | 4;

  // Lifestyle
  currentSmoker: 0 | 1;
  cigsPerDay: number;

  // Medical history
  BPMeds: 0 | 1;
  prevalentStroke: 0 | 1;
  prevalentHyp: 0 | 1;
  diabetes: 0 | 1;

  // Clinical
  totChol: number;
  sysBP: number;
  diaBP: number;
  BMI: number;
  heartRate: number;
  glucose: number;
}

export interface FactorContribution {
  factor: string;
  impact: number;
  severity: "low" | "medium" | "high";
  label: string;
  detail: string;
}

export interface PredictionResult {
  id: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  diseaseProbability: number;
  recommendations: string[];
  contributingFactors: FactorContribution[];
  input: PredictionInput;
  submittedAt: string;
}

export interface PredictionRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;

  // Framingham uses male: 0/1 instead of gender.
  male: 0 | 1;

  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  submittedAt: string;
  status: "completed" | "processing" | "failed";
  input: PredictionInput;
}
