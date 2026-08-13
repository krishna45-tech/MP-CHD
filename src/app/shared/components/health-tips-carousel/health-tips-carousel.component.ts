// =============================================================================
// Auto-rotating health tips carousel.
// =============================================================================
import { Component, Input, OnDestroy, signal } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import type { HealthTip } from '../../../core/models/health.model';

@Component({
  selector: 'app-health-tips-carousel',
  template: `
    <div class="carousel" *ngIf="tips.length > 0">
      <div class="slide" [style.--slide-tone]="tipColor" [class.is-visible]="isVisible">
        <div class="slide-icon">
          <mat-icon>{{ tips[activeIndex()]?.icon }}</mat-icon>
        </div>
        <div class="slide-body">
          <span class="slide-tag">{{ tips[activeIndex()]?.tag }}</span>
          <h5 class="slide-title">{{ tips[activeIndex()]?.title }}</h5>
          <p class="slide-text">{{ tips[activeIndex()]?.body }}</p>
        </div>
      </div>
      <div class="carousel-controls">
        <button class="carousel-nav" (click)="prev()" aria-label="Previous tip">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <div class="dots">
          <button
            *ngFor="let tip of tips; let i = index"
            class="dot"
            [class.active]="i === activeIndex()"
            (click)="goTo(i)"
            [attr.aria-label]="'Tip ' + (i + 1)"
          ></button>
        </div>
        <button class="carousel-nav" (click)="next()" aria-label="Next tip">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .carousel {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .slide {
        position: relative;
        overflow: hidden;
        display: flex;
        gap: 14px;
        align-items: flex-start;
        padding: 20px;
        border-radius: var(--radius-lg);
        background: var(--surface-glass);
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-md);
        transition: opacity 0.45s var(--ease-out), transform 0.45s var(--ease-out);
      }
      .slide::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--slide-tone), transparent);
      }
      .slide.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
      .slide-icon {
        position: relative;
        width: 48px;
        height: 48px;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--slide-tone) 14%, transparent);
        color: var(--slide-tone);
        flex-shrink: 0;
        transition: transform var(--ease-spring);
      }
      .slide-icon::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--slide-tone) 40%, transparent), transparent 70%);
        filter: blur(8px);
        z-index: -1;
      }
      .slide:hover .slide-icon {
        transform: translateY(-2px) scale(1.05);
      }
      .slide-icon mat-icon {
        font-size: 24px;
        height: 24px;
        width: 24px;
      }
      .slide-tag {
        display: inline-block;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--slide-tone);
        margin-bottom: 4px;
      }
      .slide-title {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 4px;
        font-family: var(--font-display);
      }
      .slide-text {
        margin: 0;
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.6;
      }
      .carousel-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }
      .carousel-nav {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid var(--border-strong);
        background: var(--surface);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--ease);
      }
      .carousel-nav:hover {
        color: var(--primary);
        border-color: var(--primary);
        background: var(--danger-soft);
        transform: translateY(-1px);
      }
      .carousel-nav mat-icon {
        font-size: 20px;
        height: 20px;
        width: 20px;
      }
      .dots {
        display: flex;
        gap: 6px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        border: none;
        background: var(--border-strong);
        transition: all var(--ease);
        padding: 0;
        cursor: pointer;
      }
      .dot.active {
        width: 22px;
        background: var(--gradient-brand);
        box-shadow: 0 0 10px -1px rgba(229, 57, 53, 0.6);
      }
    `,
  ],
  standalone: true,
  imports: [MatIconModule, NgIf, NgForOf],
})
export class HealthTipsCarouselComponent implements OnDestroy {
  @Input() tips: HealthTip[] = [];
  @Input() autoRotate = true;
  @Input() intervalMs = 6000;

  readonly activeIndex = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;
  private showNext = true;

  ngOnChanges(): void {
    this.showNext = true;
    if (this.autoRotate) {
      this.stopAuto();
      this.startAuto();
    }
  }

  ngOnDestroy(): void {
    this.stopAuto();
  }

  get isVisible(): boolean {
    return true;
  }

  get tipColor(): string {
    const tone = this.tips[this.activeIndex()];
    if (!tone) return 'var(--primary)';
    const map: Record<string, string> = {
      Sleep: '#1565C0',
      Exercise: '#43A047',
      Mindfulness: '#7B1FA2',
      Metrics: '#E53935',
      Nutrition: '#F9A825',
    };
    return map[tone.tag] ?? 'var(--primary)';
  }

  next(): void {
    this.activeIndex.update((i) => (i + 1) % this.tips.length);
  }

  prev(): void {
    this.activeIndex.update((i) => (i - 1 + this.tips.length) % this.tips.length);
  }

  goTo(index: number): void {
    this.activeIndex.set(index);
  }

  private startAuto(): void {
    this.timer = setInterval(() => {
      if (this.showNext) this.next();
      this.showNext = true;
    }, this.intervalMs);
  }

  private stopAuto(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
