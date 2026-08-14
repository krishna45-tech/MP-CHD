// =============================================================================
// Toast notifications rendered bottom-right (bottom-center on mobile).
// =============================================================================
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastService, Toast } from '../../../core/services/toast.service';

const ICONS: Record<Toast['type'], string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning',
};

const TONES: Record<Toast['type'], string> = {
  success: 'var(--success)',
  error: 'var(--danger)',
  info: 'var(--info)',
  warning: 'var(--warning)',
};

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div class="toast animate-scale-in" [style.--toast-tone]="tones[toast.type]">
          <div class="toast-icon">
            <mat-icon>{{ icons[toast.type] }}</mat-icon>
          </div>
          <div class="toast-body">
            <strong class="toast-title">{{ toast.title }}</strong>
            @if (toast.message) {
              <p class="toast-message">{{ toast.message }}</p>
            }
          </div>
          <button class="toast-close" (click)="dismiss(toast.id)" aria-label="Dismiss">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 2000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: min(380px, calc(100vw - 32px));
      }
      .toast {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 14px 16px;
        border-radius: var(--radius-lg);
        background: var(--surface-glass-strong);
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        border: 1px solid var(--border);
        border-left: 4px solid var(--toast-tone);
        box-shadow: var(--shadow-lg);
        transition: transform var(--ease);
      }
      .toast:hover {
        transform: translateY(-2px);
      }
      .toast-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--toast-tone);
        background: color-mix(in srgb, var(--toast-tone) 14%, transparent);
        flex-shrink: 0;
      }
      .toast-icon mat-icon {
        font-size: 20px;
        height: 20px;
        width: 20px;
      }
      .toast-body {
        flex: 1;
        min-width: 0;
      }
      .toast-title {
        font-size: 13.5px;
        color: var(--text-primary);
      }
      .toast-message {
        margin: 2px 0 0;
        font-size: 12.5px;
        color: var(--text-secondary);
      }
      .toast-close {
        border: none;
        background: transparent;
        color: var(--text-tertiary);
        padding: 2px;
        display: flex;
        border-radius: 50%;
      }
      .toast-close:hover {
        color: var(--text-primary);
        background: var(--surface-muted);
      }
      .toast-close mat-icon {
        font-size: 18px;
        height: 18px;
        width: 18px;
      }
      @media (max-width: 640px) {
        .toast-container {
          left: 16px;
          right: 16px;
          bottom: 16px;
        }
      }
    `,
  ],
  standalone: true,
  imports: [MatIconModule],
})
export class ToastContainerComponent {
  private readonly service = inject(ToastService);
  readonly toasts = this.service.list;
  readonly icons = ICONS;
  readonly tones = TONES;

  dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
