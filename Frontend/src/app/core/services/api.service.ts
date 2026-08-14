// =============================================================================
// Thin typed wrapper around HttpClient with a uniform envelope unwrap.
// =============================================================================
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DevCodeService } from './dev-code.service';
import type { ApiResponse } from '../models/common.model';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function isEnvelope(body: unknown): body is ApiResponse<unknown> {
  return (
    body !== null &&
    typeof body === 'object' &&
    'success' in (body as object) &&
    'data' in (body as object)
  );
}

function unwrapEnvelope<T>(body: unknown): T {
  return isEnvelope(body) ? (body as ApiResponse<T>).data : (body as T);
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly devCode = inject(DevCodeService);
  readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Observable<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    return this.request<T>('PUT', path, body);
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.request<T>('DELETE', path);
  }

  private request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>,
  ): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http
      .request<unknown>(method, `${this.baseUrl}${path}`, { body, params: httpParams })
      .pipe(
        timeout(25000),
        map((res) => {
          if (isEnvelope(res)) this.devCode.capture((res as ApiResponse<unknown>).message);
          return unwrapEnvelope<T>(res);
        }),
      );
  }
}
