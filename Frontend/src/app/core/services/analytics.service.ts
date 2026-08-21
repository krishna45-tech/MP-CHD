// =============================================================================
// Analytics aggregation service – derives all chart datasets.
// =============================================================================
import { Injectable, computed, inject } from '@angular/core';
import { delay, Observable, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AnalyticsSummary } from '../models/analytics.model';
import { ApiService } from './api.service';
import { HistoryService } from './history.service';
import { MOCK_USERS } from '../data/mock-data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly api = inject(ApiService);
  private readonly history = inject(HistoryService);

  private readonly summary = computed<AnalyticsSummary>(() => {
    const records = this.history.allRecords();
    const total = records.length;
    const highRisk = records.filter((r) => r.riskLevel === 'high').length;
    const mediumRisk = records.filter((r) => r.riskLevel === 'medium').length;
    const lowRisk = total - highRisk - mediumRisk;
    const avgRisk = total
      ? Math.round(records.reduce((sum, r) => sum + r.riskScore, 0) / total)
      : 0;

    const male = records.filter((r) => r.male === 1).length;
    const female = total - male;

    const ageBuckets = ['18-30', '31-40', '41-50', '51-60', '60+'];
    const ageDistribution = ageBuckets.map((range) => {
      const inRange = records.filter((r) => {
        if (range === '60+') return r.age > 60;
        const [min, max] = range.split('-').map(Number);
        return r.age >= min && r.age <= max;
      });
      return {
        range,
        total: inRange.length,
        highRisk: inRange.filter((r) => r.riskLevel === 'high').length,
      };
    });

    const monthlyPredictions = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthRecords = records.filter((r) => r.submittedAt.startsWith(key));
      return {
        month: MONTHS[d.getMonth()],
        predictions: monthRecords.length,
        highRisk: monthRecords.filter((r) => r.riskLevel === 'high').length,
      };
    });

    return {
      totalPredictions: total,
      totalUsers: MOCK_USERS.length,
      avgRiskScore: avgRisk,
      highRiskRate: total ? Math.round((highRisk / total) * 100) : 0,
      riskDistribution: [
        { label: 'Low risk', value: lowRisk, color: '#43A047' },
        { label: 'Medium risk', value: mediumRisk, color: '#F9A825' },
        { label: 'High risk', value: highRisk, color: '#E53935' },
      ],
      genderDistribution: [
        { label: 'Male', value: male },
        { label: 'Female', value: female },
      ],
      ageDistribution,
      monthlyPredictions,
    };
  });

  /** GET /api/analytics */
  getAnalytics(): Observable<AnalyticsSummary> {
    if (environment.useMock) {
      return of(this.summary()).pipe(delay(environment.mockDelay * 0.7));
    }
    return this.api.get<AnalyticsSummary>('/analytics');
  }
}
