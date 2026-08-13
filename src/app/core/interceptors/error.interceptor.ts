// =============================================================================
// HTTP interceptor – normalizes backend errors and surfaces them as toasts.
// =============================================================================
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Something went wrong. Please try again.';

      if (error.error?.message) {
        message = error.error.message;
      } else if (typeof error.error === 'string' && error.error.length > 0) {
        message = error.error;
      } else if (error.status === 0) {
        message = 'Unable to reach the server. Check your connection.';
      } else if (error.status >= 500) {
        message = 'Server error. Our team has been notified.';
      }

      toast.error('Request failed', message);
      return throwError(() => error);
    }),
  );
};
