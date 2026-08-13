// =============================================================================
// Animated counter – counts from 0 to a target value on view.
// =============================================================================
import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `{{ prefix }}<span>{{ formatted() }}</span>{{ suffix }}`,
  styles: [':host { font-variant-numeric: tabular-nums; }'],
  standalone: true,
})
export class AnimatedCounterComponent {
  @Input() value = 0;
  @Input() duration = 1100;
  @Input() decimals = 0;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() startOnView = false;

  private readonly displayed = signal(0);
  private rafId: number | null = null;

  readonly formatted = () =>
    this.displayed().toLocaleString('en-US', {
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals,
    });

  ngOnChanges(): void {
    if (this.startOnView) return;
    this.animate();
  }

  trigger(): void {
    this.animate();
  }

  private animate(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    const start = performance.now();
    const from = 0;
    const to = Math.max(0, this.value);

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / this.duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayed.set(from + (to - from) * eased);
      if (progress < 1) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.displayed.set(to);
        this.rafId = null;
      }
    };
    this.rafId = requestAnimationFrame(step);
  }
}
