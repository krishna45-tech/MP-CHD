// =============================================================================
// Global search service – searches patients + predictions (mock aware).
// =============================================================================
import { Injectable, inject } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_USERS } from '../data/mock-data';
import type { PredictionRecord } from '../models/prediction.model';
import type { User } from '../models/user.model';
import { HistoryService } from './history.service';

export interface GlobalSearchResult {
  patients: User[];
  predictions: PredictionRecord[];
  query: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly history = inject(HistoryService);

  search(query: string): Observable<GlobalSearchResult> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return of({ patients: [], predictions: [], query });
    }
    const patients = environment.useMock
      ? MOCK_USERS.filter(
          (u) =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q),
        ).slice(0, 5)
      : [];
    const predictions = environment.useMock
      ? this.history
          .allRecords()
          .filter(
            (r) =>
              r.patientName.toLowerCase().includes(q) ||
              r.id.toLowerCase().includes(q),
          )
          .slice(0, 5)
      : [];
    return of({ patients, predictions, query }).pipe(delay(250));
  }
}
