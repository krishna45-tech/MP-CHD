// =============================================================================
// Dashboard aggregation service (welcome card, health score, notifications…).
// =============================================================================
import { Injectable, computed, inject } from '@angular/core';
import { delay, Observable, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MOCK_ACTIVITIES,
  MOCK_DASHBOARD_METRICS,
  MOCK_HEALTH_TIPS,
  MOCK_NOTIFICATIONS,
} from '../data/mock-data';
import type { DashboardSummary } from '../models/health.model';
import type { AppNotification } from '../models/health.model';
import type { ActivityEvent } from '../models/health.model';
import type { HealthTip } from '../models/health.model';
import { ApiService } from './api.service';
import { HistoryService } from './history.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);
  private readonly history = inject(HistoryService);

  private readonly baseSummary = computed<DashboardSummary>(() => {
    const records = this.history.allRecords();
    const recent = [...records]
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .slice(0, 5);
    const latest = recent[0];
    const monthKey = new Date().toISOString().slice(0, 7);
    const monthCount = records.filter((r) => r.submittedAt.startsWith(monthKey)).length;
    return {
      healthScore: latest ? Math.round(100 - latest.riskScore) : 82,
      riskLevel: latest?.riskLevel ?? 'low',
      riskScore: latest?.riskScore ?? 18,
      recentPredictions: recent,
      metrics: MOCK_DASHBOARD_METRICS,
      totalPredictions: records.length,
      monthPredictions: monthCount,
      streakDays: 12,
    };
  });

  /** GET /api/dashboard */
  getSummary(): Observable<DashboardSummary> {
    if (environment.useMock) {
      return of(this.baseSummary()).pipe(delay(environment.mockDelay * 0.6));
    }
    return this.api.get<DashboardSummary>('/dashboard');
  }

  getNotifications(): Observable<AppNotification[]> {
    if (environment.useMock) {
      return of(MOCK_NOTIFICATIONS).pipe(delay(environment.mockDelay * 0.3));
    }
    return this.api.get<AppNotification[]>('/dashboard/notifications');
  }

  getActivities(): Observable<ActivityEvent[]> {
    if (environment.useMock) {
      return of(MOCK_ACTIVITIES).pipe(delay(environment.mockDelay * 0.3));
    }
    return this.api.get<ActivityEvent[]>('/dashboard/activities');
  }

  getHealthTips(): Observable<HealthTip[]> {
    if (environment.useMock) {
      return of(MOCK_HEALTH_TIPS).pipe(delay(200));
    }
    return this.api.get<HealthTip[]>('/dashboard/tips');
  }
}
