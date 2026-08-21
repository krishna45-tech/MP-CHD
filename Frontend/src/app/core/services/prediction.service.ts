// =============================================================================
// Prediction service – communicates with the real CardioSight backend.
// =============================================================================

import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type {
  PredictionInput,
  PredictionResult,
} from "../models/prediction.model";

import { ApiService } from "./api.service";

@Injectable({
  providedIn: "root",
})
export class PredictionService {
  private readonly api = inject(ApiService);

  /**
   * POST /api/predict
   *
   * Sends the 15 Framingham features to the Node backend.
   */
  predict(input: PredictionInput): Observable<PredictionResult> {
    return this.api.post<PredictionResult>("/predict", input);
  }

  /**
   * GET /api/predict/:id
   *
   * Fetches a previously stored prediction.
   */
  getResult(id: string): Observable<PredictionResult> {
    return this.api.get<PredictionResult>(`/predict/${id}`);
  }
}
