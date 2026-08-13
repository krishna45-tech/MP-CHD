// =============================================================================
// Stat card – compact KPI tile used across dashboard / admin / analytics.
// =============================================================================
import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type StatTone = 'primary' | 'secondary' | 'accent' | 'warning' | 'danger';

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="stat-card" [class.is-loading]="loading" [style.--tone]="toneColor">
      <div class="stat-icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <div class="stat-body">
        <p class="stat-label">{{ label }}</p>
        <div class="stat-value-row">
          <ng-content></ng-content>
        </div>
        <div class="stat-footer" *ngIf="!loading">
          <span *ngIf="trend !== undefined" class="stat-trend" [class.down]="trend < 0">
            <mat-icon>{{ trend >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
            {{ trend >= 0 ? '+' : '' }}{{ trend }}%
          </span>
          <span class="stat-sub" *ngIf="subtitle">{{ subtitle }}</span>
          <span class="stat-sub" *ngIf="!subtitle && !hasTrend">vs last month</span>
        </div>
        <div class="skeleton-line" *ngIf="loading"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .stat-card {
        position: relative;
        overflow: hidden;
        display: flex;
        gap: 16px;
        padding: 20px;
        border-radius: var(--radius-xl);
        background: var(--surface);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
        transition: transform var(--ease-spring), box-shadow var(--ease), border-color var(--ease);
      }
      .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--tone), transparent);
        opacity: 0;
        transition: opacity var(--ease);
      }
      .stat-card:hover {
        transform: translateY(-6px);
        box-shadow: var(--shadow-xl);
        border-color: var(--border-strong);
      }
      .stat-card:hover::before {
        opacity: 1;
      }
      .stat-icon {
        position: relative;
        width: 52px;
        height: 52px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--tone) 13%, transparent);
        color: var(--tone);
        flex-shrink: 0;
        transition: transform var(--ease-spring);
      }
      .stat-icon::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--tone) 42%, transparent), transparent 70%);
        filter: blur(8px);
        z-index: -1;
        opacity: 0;
        transition: opacity var(--ease);
      }
      .stat-card:hover .stat-icon {
        transform: translateY(-2px) scale(1.06);
      }
      .stat-card:hover .stat-icon::after {
        opacity: 1;
      }
      .stat-icon mat-icon {
        font-size: 26px;
        height: 26px;
        width: 26px;
      }
      .stat-body {
        flex: 1;
        min-width: 0;
      }
      .stat-label {
        margin: 0;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-tertiary);
      }
      .stat-value-row {
        font-size: 27px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.2;
        margin-top: 3px;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .stat-footer {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        font-size: 12.5px;
      }
      .stat-trend {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-weight: 700;
        color: var(--success);
        padding: 3px 9px;
        border-radius: var(--radius-full);
        background: var(--success-soft);
      }
      .stat-trend.down {
        color: var(--danger);
        background: var(--danger-soft);
      }
      .stat-trend mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
      }
      .stat-sub {
        color: var(--text-tertiary);
      }
      .is-loading .stat-value-row {
        display: none;
      }
      .skeleton-line {
        height: 20px;
        border-radius: var(--radius-sm);
        margin-top: 10px;
        background-image: linear-gradient(
          90deg,
          var(--surface-muted) 0%,
          rgba(255, 255, 255, 0.35) 50%,
          var(--surface-muted) 100%
        );
        background-size: 600px 100%;
        animation: shimmer 1.5s linear infinite;
      }
      html.dark .skeleton-line {
        background-image: linear-gradient(
          90deg,
          var(--surface-muted) 0%,
          rgba(255, 255, 255, 0.06) 50%,
          var(--surface-muted) 100%
        );
      }
    `,
  ],
  standalone: true,
  imports: [MatIconModule, NgIf],
})
export class StatCardComponent {
  @Input() label = '';
  @Input() icon = 'insights';
  @Input() tone: StatTone = 'primary';
  @Input() trend?: number;
  @Input() subtitle = '';
  @Input() loading = false;

  readonly toneColor = computedTone(this);

  get hasTrend(): boolean {
    return this.trend !== undefined;
  }
}

function computedTone(host: StatCardComponent): string {
  const map: Record<StatTone, string> = {
    primary: '#E53935',
    secondary: '#1565C0',
    accent: '#43A047',
    warning: '#F9A825',
    danger: '#D32F2F',
  };
  return map[host.tone];
}
