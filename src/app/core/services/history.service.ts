// =============================================================================
// Prediction history store + query service.
// In mock mode it seeds from the dummy dataset and persists additions locally,
// so history / dashboard / analytics stay in sync.
// =============================================================================
import { Injectable, inject, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_PREDICTIONS } from '../data/mock-data';
import type { PaginatedResponse } from '../models/common.model';
import type { PredictionRecord } from '../models/prediction.model';
import { ApiService } from './api.service';

const STORAGE_KEY = 'cardiosight_records';

export interface HistoryQuery {
  page: number;
  pageSize: number;
  search?: string;
  risk?: 'low' | 'medium' | 'high' | 'all';
  sortBy?: 'submittedAt' | 'riskScore' | 'age' | 'confidence';
  sortDir?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly api = inject(ApiService);
  private readonly records = signal<PredictionRecord[]>(this.loadSeed());

  readonly allRecords = this.records.asReadonly();

  /** GET /api/history */
  list(query: HistoryQuery): Observable<PaginatedResponse<PredictionRecord>> {
    if (environment.useMock) {
      let items = [...this.records()];
      const q = query.search?.trim().toLowerCase() ?? '';
      if (q) {
        items = items.filter(
          (r) =>
            r.patientName.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q) ||
            String(r.riskScore).includes(q),
        );
      }
      if (query.risk && query.risk !== 'all') {
        items = items.filter((r) => r.riskLevel === query.risk);
      }
      const dir = query.sortDir === 'asc' ? 1 : -1;
      const sortBy = query.sortBy ?? 'submittedAt';
      items = [...items].sort((a, b) => {
        const va = a[sortBy];
        const vb = b[sortBy];
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
      const page = Math.min(query.page, totalPages);
      const start = (page - 1) * query.pageSize;
      return of({
        items: items.slice(start, start + query.pageSize),
        total,
        page,
        pageSize: query.pageSize,
        totalPages,
      }).pipe(delay(environment.mockDelay));
    }
    return this.api.get<PaginatedResponse<PredictionRecord>>('/history', {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      risk: query.risk,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    });
  }

  getById(id: string): Observable<PredictionRecord | undefined> {
    if (environment.useMock) {
      return of(this.records().find((r) => r.id === id)).pipe(delay(200));
    }
    return this.api.get<PredictionRecord>(`/history/${id}`);
  }

  /** Registers a freshly-computed prediction so it shows up across the app. */
  add(record: PredictionRecord): void {
    this.records.update((list) => [record, ...list]);
    this.persist();
  }

  delete(id: string): Observable<{ message: string }> {
    if (environment.useMock) {
      this.records.update((list) => list.filter((r) => r.id !== id));
      this.persist();
      return of({ message: 'Prediction record deleted.' }).pipe(delay(300));
    }
    return this.api.delete<{ message: string }>(`/history/${id}`);
  }

  private loadSeed(): PredictionRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as PredictionRecord[];
      } catch {
        /* fall through to default seed */
      }
    }
    return MOCK_PREDICTIONS;
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records()));
    } catch {
      /* storage may be unavailable */
    }
  }
}
