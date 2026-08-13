// =============================================================================
// Thin Chart.js wrapper component. Accepts a plain config and re-renders
// reactively whenever inputs change.
// =============================================================================
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import type { ChartConfiguration } from 'chart.js';
import { Chart } from './chart.config';

export type ChartKind = 'line' | 'bar' | 'doughnut' | 'pie' | 'radar';

export type ChartWidgetOptions = NonNullable<ChartConfiguration['options']> & {
  cutout?: string | number;
};

export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean | 'origin';
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  borderDash?: number[];
  stack?: string;
  borderRadius?: number;
}

@Component({
  selector: 'app-chart',
  template: `
    <div class="chart-shell" [style.height]="height">
      <canvas #canvas>{{ chartFallbackLabel }}</canvas>
    </div>
  `,
  styles: [
    `
      .chart-shell {
        width: 100%;
        position: relative;
      }
      .chart-shell canvas {
        max-width: 100%;
      }
    `,
  ],
  standalone: true,
})
export class ChartWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) kind!: ChartKind;
  @Input() labels: string[] = [];
  @Input() datasets: ChartDataset[] = [];
  @Input() options: ChartWidgetOptions = {};
  @Input() height = '280px';
  @Input() ariaLabel = 'Chart';

  private chart?: Chart;

  get chartFallbackLabel(): string {
    return this.ariaLabel;
  }

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && changes['labels'] || changes['datasets']) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    if (!this.canvasRef?.nativeElement) return;

    const mergedOptions: ChartWidgetOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 900,
        easing: 'easeOutQuart',
      },
      ...this.options,
    };

    const config: ChartConfiguration = {
      type: this.kind,
      data: { labels: this.labels, datasets: this.datasets },
      options: mergedOptions,
    };

    if (this.chart) {
      this.chart.data = config.data;
      this.chart.options = mergedOptions;
      this.chart.update();
    } else {
      this.chart = new Chart(this.canvasRef.nativeElement, config);
    }
  }
}
