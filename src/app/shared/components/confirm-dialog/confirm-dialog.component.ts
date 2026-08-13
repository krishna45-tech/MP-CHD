// =============================================================================
// Reusable confirmation dialog backed by Angular Material.
// =============================================================================
import { Component, Inject, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  icon?: string;
}

export function openConfirm(dialog: MatDialog, data: ConfirmDialogData) {
  return dialog.open(ConfirmDialogComponent, {
    data,
    width: '420px',
    autoFocus: false,
    disableClose: true,
    panelClass: 'confirm-dialog-panel',
  });
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="dialog">
      <div class="dialog-icon" [class.danger]="data.danger">
        <mat-icon>{{ data.icon ?? (data.danger ? 'warning_amber' : 'help_outline') }}</mat-icon>
      </div>
      <h2 class="dialog-title">{{ data.title }}</h2>
      <p class="dialog-message">{{ data.message }}</p>
      <div class="dialog-actions">
        <button mat-stroked-button (click)="ref.close(false)">
          {{ data.cancelText ?? 'Cancel' }}
        </button>
        <button
          mat-flat-button
          [color]="data.danger ? 'warn' : 'primary'"
          (click)="ref.close(true)"
        >
          {{ data.confirmText ?? 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog {
        padding: 28px 28px 24px;
        text-align: center;
      }
      .dialog-icon {
        position: relative;
        width: 66px;
        height: 66px;
        margin: 0 auto 16px;
        border-radius: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(21, 101, 192, 0.14), rgba(21, 101, 192, 0.05));
        color: var(--secondary);
        box-shadow: 0 10px 26px -10px rgba(21, 101, 192, 0.45);
      }
      .dialog-icon.danger {
        background: linear-gradient(135deg, var(--danger-soft), color-mix(in srgb, var(--danger) 8%, transparent));
        color: var(--danger);
        box-shadow: 0 10px 26px -10px rgba(229, 57, 53, 0.45);
      }
      .dialog-icon::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.35), transparent 65%);
      }
      .dialog-icon mat-icon {
        font-size: 32px;
        height: 32px;
        width: 32px;
        position: relative;
      }
      .dialog-title {
        font-size: 19px;
        font-weight: 700;
        margin-bottom: 8px;
        font-family: var(--font-display);
      }
      .dialog-message {
        color: var(--text-secondary);
        font-size: 13.5px;
        margin: 0 auto 22px;
        max-width: 320px;
        line-height: 1.65;
      }
      .dialog-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
      .dialog-actions button {
        min-width: 120px;
      }
    `,
  ],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
})
export class ConfirmDialogComponent {
  readonly ref = inject(MatDialogRef<ConfirmDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) readonly data: ConfirmDialogData) {}
}

export { MatDialog };
