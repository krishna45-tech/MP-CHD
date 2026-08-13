// =============================================================================
// Root routing table. Feature modules are lazy-loaded.
// =============================================================================
import { Routes } from '@angular/router';
import { AppShellComponent } from './core/components/layout/app-shell/app-shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing-page.component').then((m) => m.LandingPageComponent),
    data: { title: 'Home' },
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    component: AppShellComponent,
    loadChildren: () => import('./features/pages.routes').then((m) => m.appRoutes),
  },
  {
    path: 'not-found',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  { path: '**', redirectTo: '/not-found' },
];
