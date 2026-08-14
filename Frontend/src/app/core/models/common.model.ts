// =============================================================================
// Generic API types shared across the whole application.
// =============================================================================

/** Standard envelope returned by the backend for every JSON response. */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

/** Paginated collection envelope. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Normalized error payload. */
export interface ApiError {
  success: false;
  status: number;
  message: string;
  errors?: Record<string, string>;
}

/** Risk classification used across prediction, dashboard and analytics. */
export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskMeta {
  level: RiskLevel;
  label: string;
  color: string;
  softColor: string;
  min: number;
  max: number;
}
