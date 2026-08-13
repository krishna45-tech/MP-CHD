// =============================================================================
// Admin service – user management, platform stats and activity feed.
// =============================================================================
import { Injectable, inject } from '@angular/core';
import { delay, Observable, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_ADMIN_ACTIVITIES, MOCK_USERS } from '../data/mock-data';
import type {
  AdminActivity,
  AdminStats,
  AdminUserRow,
} from '../models/analytics.model';
import { ApiService } from './api.service';
import { HistoryService } from './history.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);
  private readonly history = inject(HistoryService);

  /** GET /api/admin/stats */
  getStats(): Observable<AdminStats> {
    if (environment.useMock) {
      const predictions = this.history.allRecords();
      const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const stats: AdminStats = {
        totalUsers: MOCK_USERS.length,
        patients: MOCK_USERS.filter((u) => u.role === 'patient').length,
        admins: MOCK_USERS.filter((u) => u.role === 'admin').length,
        totalPredictions: predictions.length,
        predictionsThisWeek: predictions.filter((r) => new Date(r.submittedAt).getTime() >= weekStart).length,
        highRiskPredictions: predictions.filter((r) => r.riskLevel === 'high').length,
        avgRiskScore: predictions.length
          ? Math.round(predictions.reduce((sum, r) => sum + r.riskScore, 0) / predictions.length)
          : 0,
        newUsersThisMonth: MOCK_USERS.filter(
          (u) => new Date(u.createdAt).getMonth() === new Date().getMonth(),
        ).length,
      };
      return of(stats).pipe(delay(environment.mockDelay * 0.6));
    }
    return this.api.get<AdminStats>('/admin/stats');
  }

  /** GET /api/admin/users */
  getUsers(search = ''): Observable<AdminUserRow[]> {
    if (environment.useMock) {
      const q = search.trim().toLowerCase();
      const rows: AdminUserRow[] = MOCK_USERS.map((user, i) => ({
        ...user,
        predictionsCount: (i * 3) % 14,
        lastActiveAt: new Date(Date.now() - (i * 37 * 60 * 60 * 1000)).toISOString(),
        status: i % 7 === 0 ? 'inactive' : i % 13 === 0 ? 'suspended' : 'active',
      }));
      const filtered = q
        ? rows.filter(
            (u) =>
              `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q),
          )
        : rows;
      return of(filtered).pipe(delay(environment.mockDelay * 0.6));
    }
    return this.api.get<AdminUserRow[]>('/admin/users', { search });
  }

  deleteUser(id: string): Observable<{ message: string }> {
    if (environment.useMock) {
      return of({ message: 'User account removed.' }).pipe(delay(300));
    }
    return this.api.delete<{ message: string }>(`/admin/users/${id}`);
  }

  /** GET /api/admin/activities */
  getActivities(): Observable<AdminActivity[]> {
    if (environment.useMock) {
      return of(MOCK_ADMIN_ACTIVITIES).pipe(delay(300));
    }
    return this.api.get<AdminActivity[]>('/admin/activities');
  }
}
