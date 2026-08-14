// =============================================================================
// Circular progress ring (SVG) – used for health score & confidence.
// =============================================================================
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-circular-progress',
  template: `
    <div class="ring" [style.width.px]="size" [style.height.px]="size" [style.--cp]="color">
      <svg viewBox="0 0 120 120">
        <circle
          class="track"
          cx="60"
          cy="60"
          r="52"
          fill="none"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke]="trackColor"
        />
        <circle
          class="value"
          cx="60"
          cy="60"
          r="52"
          fill="none"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset"
          [attr.stroke]="color"
          stroke-linecap="round"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div class="ring-content"><ng-content></ng-content></div>
    </div>
  `,
  styles: [
    `
      .ring {
        position: relative;
        display: inline-block;
      }
      .ring svg {
        width: 100%;
        height: 100%;
        display: block;
        transform: scaleX(-1);
        filter: drop-shadow(0 14px 28px rgba(16, 23, 40, 0.14));
      }
      .track {
        opacity: 0.22;
      }
      .value {
        transition: stroke-dashoffset 1s var(--ease-out);
        filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--cp) 65%, transparent));
      }
      .ring-content {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        text-align: center;
      }
    `,
  ],
  standalone: true,
})
export class CircularProgressComponent {
  @Input() value = 0;
  @Input() color = 'var(--primary)';
  @Input() trackColor = 'var(--border)';
  @Input() size = 160;
  @Input() strokeWidth = 10;

  readonly radius = 52;
  readonly circumference = 2 * Math.PI * 52;

  get dashOffset(): number {
    const normalized = Math.min(100, Math.max(0, this.value));
    return this.circumference * (1 - normalized / 100);
  }
}
