// =============================================================================
// Beautiful empty state used for zero-result lists and tables.
// =============================================================================
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty">
      <div class="empty-illustration">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h4 class="empty-title">{{ title }}</h4>
      <p class="empty-message">{{ message }}</p>
      <div class="empty-actions"><ng-content></ng-content></div>
    </div>
  `,
  styles: [
    `
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 48px 24px;
      }
      .empty-illustration {
        position: relative;
        width: 92px;
        height: 92px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--surface-muted), color-mix(in srgb, var(--primary) 7%, var(--surface)));
        color: var(--text-tertiary);
        margin-bottom: 18px;
      }
      .empty-illustration::after {
        content: '';
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        border: 1.5px dashed var(--border-strong);
        animation: spin 18s linear infinite;
      }
      .empty-illustration mat-icon {
        font-size: 40px;
        height: 40px;
        width: 40px;
        filter: drop-shadow(0 6px 16px rgba(229, 57, 53, 0.18));
      }
      .empty-title {
        font-size: 17px;
        font-weight: 600;
        color: var(--text-primary);
      }
      .empty-message {
        max-width: 380px;
        color: var(--text-secondary);
        font-size: 13.5px;
        margin: 8px 0 0;
      }
      .empty-actions {
        margin-top: 20px;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
  standalone: true,
  imports: [MatIconModule],
})
export class EmptyStateComponent {
  @Input() icon = 'search_off';
  @Input() title = 'Nothing here yet';
  @Input() message = 'There is no data to display right now.';
}
