// =============================================================================
// Dashboard & patient health models.
// =============================================================================
import type { RiskLevel } from './common.model';
import type { PredictionRecord } from './prediction.model';

export interface HealthMetric {
  key: string;
  label: string;
  value: number;
  unit: string;
  goodRange: [number, number];
  status: 'good' | 'warning' | 'danger';
}

/** Aggregated values shown on the patient dashboard hero cards. */
export interface DashboardSummary {
  healthScore: number; // 0 .. 100
  riskLevel: RiskLevel;
  riskScore: number;
  recentPredictions: PredictionRecord[];
  metrics: HealthMetric[];
  totalPredictions: number;
  monthPredictions: number;
  streakDays: number;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'danger';
export type NotificationIcon = 'favorite' | 'schedule' | 'insights' | 'warning';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  icon: NotificationIcon;
  createdAt: string;
  read: boolean;
}

export interface HealthTip {
  id: string;
  title: string;
  body: string;
  icon: string;
  tag: string;
}

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface RecommendationCard {
  icon: string;
  title: string;
  body: string;
  tone: 'primary' | 'secondary' | 'accent' | 'warning';
}
