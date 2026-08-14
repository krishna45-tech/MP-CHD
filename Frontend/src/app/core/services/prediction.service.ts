// =============================================================================
// Prediction service – submits inputs to the ML engine and fetches results.
// =============================================================================
import { Injectable, inject } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { mockPredictionResult, MOCK_PREDICTIONS } from '../data/mock-data';
import type { PredictionInput, PredictionRecord, PredictionResult } from '../models/prediction.model';
import { ApiService } from './api.service';
import { HistoryService } from './history.service';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly api = inject(ApiService);
  private readonly history = inject(HistoryService);

  /** POST /api/predict */
  predict(input: PredictionInput): Observable<PredictionResult> {
    if (environment.useMock) {
      const result = mockPredictionResult(input);
      const record: PredictionRecord = {
        id: result.id,
        patientId: 'usr_001',
        patientName: 'Aarav Sharma',
        age: input.age,
        gender: input.gender,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        confidence: result.confidence,
        submittedAt: result.submittedAt,
        status: 'completed',
        input,
      };
      return of(result).pipe(
        delay(environment.mockDelay),
        map((res) => {
          this.history.add(record);
          return res;
        }),
      );
    }
    return this.api.post<PredictionResult>('/predict', input);
  }

  /** Fetches a stored result (falls back to mock when offline). */
  getResult(id: string): Observable<PredictionResult> {
    if (environment.useMock) {
      const record = this.history.allRecords().find((r) => r.id === id);
      if (record) {
        const { riskScore: score, riskLevel: level, confidence, contributingFactors: factors, recommendations } =
          mockPredictionResult(record.input);
        const result: PredictionResult = {
          id: record.id,
          riskScore: score,
          riskLevel: level,
          confidence,
          diseaseProbability: Math.min(99, score + 3),
          recommendations,
          contributingFactors: factors,
          input: record.input,
          submittedAt: record.submittedAt,
        };
        return of(result).pipe(delay(300));
      }
      return of(mockPredictionResult(MOCK_PREDICTIONS[0].input)).pipe(delay(300));
    }
    return this.api.get<PredictionResult>(`/predict/${id}`);
  }
}
