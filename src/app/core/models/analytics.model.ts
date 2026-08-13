// =============================================================================
// Analytics & admin models.
// =============================================================================
import type { User } from './user.model';
import type { PredictionRecord } from './prediction.model';

export interface RiskDistributionSlice {
  label: string;
  value: number;
  color: string;
}

export interface GenderDistributionSlice {
  label: string;
  value: number;
}

export interface AgeDistributionSlice {
  range: string;
  total: number;
  highRisk: number;
}

export interface MonthlyPredictionsPoint {
  month: string;
  predictions: number;
  highRisk: number;
}

export interface AnalyticsSummary {
  totalPredictions: number;
  totalUsers: number;
  avgRiskScore: number;
  highRiskRate: number; // percentage
  riskDistribution: RiskDistributionSlice[];
  genderDistribution: GenderDistributionSlice[];
  ageDistribution: AgeDistributionSlice[];
  monthlyPredictions: MonthlyPredictionsPoint[];
}

export interface AdminStats {
  totalUsers: number;
  patients: number;
  admins: number;
  totalPredictions: number;
  predictionsThisWeek: number;
  highRiskPredictions: number;
  avgRiskScore: number;
  newUsersThisMonth: number;
}

export interface AdminUserRow extends User {
  predictionsCount: number;
  lastActiveAt: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface AdminActivity {
  id: string;
  user: string;
  role: string;
  action: string;
  target: string;
  icon: string;
  createdAt: string;
}

export interface RecentPredictionRow extends PredictionRecord {
  patientId: string;
}
