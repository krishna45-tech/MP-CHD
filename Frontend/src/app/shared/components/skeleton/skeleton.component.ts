// =============================================================================
// Configurable loading skeleton.
// =============================================================================
import { Component, Input } from '@angular/core';

export type SkeletonVariant = 'card' | 'list' | 'table' | 'chart' | 'inline';

@Component({
  selector: 'app-skeleton',
  template: `
    @switch (variant) {
      @case ('card') {
        <div class="sk-card skeleton">
          <div class="sk-circle"></div>
          <div class="sk-lines">
            <span class="sk-line w40"></span>
            <span class="sk-line w80"></span>
            <span class="sk-line w60"></span>
          </div>
        </div>
      }
      @case ('list') {
        <div class="sk-list skeleton">
          @for (_ of rowCount; track $index) {
            <div class="sk-row">
              <div class="sk-avatar"></div>
              <div class="sk-lines flex-1">
                <span class="sk-line w70"></span>
                <span class="sk-line w40"></span>
              </div>
            </div>
          }
        </div>
      }
      @case ('table') {
        <div class="sk-table skeleton">
          <span class="sk-line w30 table-head"></span>
          @for (_ of rowCount; track $index) {
            <span class="sk-line table-cell"></span>
          }
        </div>
      }
      @case ('chart') {
        <div class="sk-chart skeleton">
          <span class="sk-line w40 chart-title"></span>
          <div class="sk-chart-body"></div>
        </div>
      }
      @default {
        <span class="sk-inline skeleton"></span>
      }
    }
  `,
  styles: [
    `
      .sk-card {
        display: flex;
        gap: 14px;
        padding: 20px;
        border-radius: var(--radius-xl);
        border: 1px solid var(--border);
        background: var(--surface);
        box-shadow: var(--shadow-sm);
      }
      .sk-circle {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        flex-shrink: 0;
      }
      .sk-lines {
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
      }
      .sk-line {
        height: 14px;
        border-radius: 6px;
        display: block;
      }
      .w40 { width: 40%; }
      .w60 { width: 60%; }
      .w70 { width: 70%; }
      .w80 { width: 80%; }
      .w30 { width: 30%; }
      .flex-1 { flex: 1; }
      .sk-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 18px;
      }
      .sk-row {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .sk-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .sk-table {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 18px;
      }
      .sk-table .table-head {
        height: 16px;
        margin-bottom: 6px;
      }
      .sk-table .table-cell {
        height: 20px;
        width: 100%;
      }
      .sk-chart {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .sk-chart .chart-title {
        height: 16px;
      }
      .sk-chart-body {
        height: 240px;
        border-radius: var(--radius-lg);
      }
      .sk-inline {
        width: 100%;
        height: 14px;
        border-radius: 6px;
      }
      .sk-circle,
      .sk-line,
      .sk-avatar,
      .sk-chart-body,
      .sk-table .table-cell {
        background: var(--surface-muted);
        background-image: linear-gradient(
          90deg,
          var(--surface-muted) 0%,
          rgba(255, 255, 255, 0.35) 50%,
          var(--surface-muted) 100%
        );
        background-size: 600px 100%;
        animation: shimmer 1.5s linear infinite;
      }
      html.dark .sk-circle,
      html.dark .sk-line,
      html.dark .sk-avatar,
      html.dark .sk-chart-body,
      html.dark .sk-table .table-cell {
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
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'inline';
  @Input() rows = 4;

  get rowCount(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}
