// =============================================================================
// Route guard – only administrators may access admin areas.
// =============================================================================
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (auth.isAdmin()) {
    return true;
  }
  toast.error('Access denied', 'You need administrator privileges to view this page.');
  return router.createUrlTree(['/app/dashboard']);
};
