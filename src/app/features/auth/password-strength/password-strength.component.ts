// =============================================================================
// Password strength meter.
// =============================================================================
import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

interface StrengthTier {
  score: number;
  label: string;
  color: string;
}

const TIERS: StrengthTier[] = [
  { score: 0, label: 'Too weak', color: 'var(--danger)' },
  { score: 1, label: 'Weak', color: 'var(--danger)' },
  { score: 2, label: 'Fair', color: 'var(--warning)' },
  { score: 3, label: 'Good', color: 'var(--secondary)' },
  { score: 4, label: 'Strong', color: 'var(--success)' },
];

@Component({
  selector: 'app-password-strength',
  template: `
    <div class="strength" *ngIf="password">
      <div class="bars">
        @for (bar of [1, 2, 3, 4]; track bar) {
          <span class="bar" [class.active]="bar <= score()" [style.--bar-color]="tier().color"></span>
        }
      </div>
      <span class="label" [style.color]="tier().color">{{ tier().label }}</span>
    </div>
  `,
  styles: [
    `
      .strength {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 8px;
      }
      .bars {
        display: flex;
        gap: 5px;
        flex: 1;
      }
      .bar {
        height: 5px;
        flex: 1;
        border-radius: 999px;
        background: var(--border);
        transition: background 0.25s ease;
      }
      .bar.active {
        background: var(--bar-color);
      }
      .label {
        font-size: 12px;
        font-weight: 600;
        min-width: 64px;
        text-align: right;
      }
    `,
  ],
  standalone: true,
  imports: [NgIf],
})
export class PasswordStrengthComponent {
  @Input() password = '';

  score(): number {
    const value = this.password;
    if (!value) return 0;
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  }

  tier(): StrengthTier {
    return TIERS[this.score()];
  }
}
