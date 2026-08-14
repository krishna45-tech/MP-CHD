// =============================================================================
// Breadcrumbs derived from the active route.
// =============================================================================
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';

interface Crumb {
  label: string;
  url: string;
  last: boolean;
}

const LABELS: Record<string, string> = {
  app: 'Home',
  dashboard: 'Dashboard',
  predict: 'New Prediction',
  result: 'Prediction Result',
  history: 'History',
  profile: 'Profile',
  admin: 'Admin Panel',
  users: 'Users',
  analytics: 'Analytics',
  about: 'About Project',
  landing: 'Home',
  auth: 'Account',
  login: 'Sign In',
  register: 'Create Account',
  'forgot-password': 'Forgot Password',
  'verify-email': 'Verify Email',
};

function prettify(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

@Component({
  selector: 'app-breadcrumbs',
  template: `
    <nav class="crumbs" aria-label="Breadcrumb">
      <a class="crumb-link" routerLink="/landing">
        <mat-icon>home</mat-icon>
      </a>
      @for (crumb of crumbs(); track crumb.url) {
        <span class="crumb-sep">
          <mat-icon>chevron_right</mat-icon>
        </span>
        @if (crumb.last) {
          <span class="crumb-current">{{ crumb.label }}</span>
        } @else {
          <a class="crumb-link" [routerLink]="crumb.url">{{ crumb.label }}</a>
        }
      }
    </nav>
  `,
  styles: [
    `
      .crumbs {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        overflow: hidden;
        white-space: nowrap;
        padding: 6px 12px;
        border-radius: var(--radius-full);
        background: var(--surface-glass);
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-xs);
      }
      .crumb-link {
        display: inline-flex;
        align-items: center;
        color: var(--text-secondary);
        font-weight: 500;
        transition: color var(--transition);
      }
      .crumb-link:hover {
        color: var(--primary);
      }
      .crumb-link mat-icon {
        font-size: 18px;
        height: 18px;
        width: 18px;
      }
      .crumb-sep {
        display: flex;
        color: var(--text-tertiary);
        opacity: 0.7;
      }
      .crumb-sep mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
      }
      .crumb-current {
        color: var(--text-primary);
        font-weight: 600;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    `,
  ],
  standalone: true,
  imports: [MatIconModule, RouterLink],
})
export class BreadcrumbsComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly crumbs = signal<Crumb[]>([]);

  constructor() {
    this.update();
    const sub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.update());
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private update(): void {
    const url = this.router.url.split('?')[0];
    const parts = url.split('/').filter(Boolean);
    const crumbs: Crumb[] = [];
    let acc = '';

    parts.forEach((part, index) => {
      acc += `/${part}`;
      const label = LABELS[part] ?? prettify(part);
      crumbs.push({ label, url: acc, last: index === parts.length - 1 });
    });

    this.crumbs.set(crumbs);
  }
}
