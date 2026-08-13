// =============================================================================
// HTTP interceptor – attaches the JWT bearer token to every outgoing request.
// =============================================================================
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();

  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    const authenticated = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(authenticated);
  }
  return next(req);
};
