// =============================================================================
// Small horizontal progress bar.
// =============================================================================
import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  template: `
    <div class="progress">
      <div class="progress-head" *ngIf="label || showValue">
        <span class="progress-label">{{ label }}</span>
        <span class="progress-value">{{ value }}{{ unit }}</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          [style.width.%]="value"
          [style.background]="color"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .progress {
        width: 100%;
      }
      .progress-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 7px;
        font-size: 13px;
      }
      .progress-label {
        color: var(--text-secondary);
        font-weight: 600;
      }
      .progress-value {
        color: var(--text-primary);
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .progress-track {
        height: 8px;
        border-radius: 999px;
        background: var(--surface-muted);
        overflow: hidden;
        box-shadow: inset 0 1px 2px rgba(16, 23, 40, 0.08);
      }
      .progress-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.9s var(--ease-out);
        box-shadow: 0 2px 10px -2px color-mix(in srgb, currentColor 55%, transparent);
        position: relative;
      }
      .progress-fill::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.28), transparent 55%);
        border-radius: inherit;
      }
    `,
  ],
  standalone: true,
  imports: [NgIf],
})
export class ProgressBarComponent {
  @Input() value = 0;
  @Input() color = 'var(--primary)';
  @Input() label = '';
  @Input() unit = '';
  @Input() showValue = true;
}
