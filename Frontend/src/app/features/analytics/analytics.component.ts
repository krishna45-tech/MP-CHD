// =============================================================================
// Analytics page – population-level charts from the analytics service.
// =============================================================================
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ChartWidgetComponent } from '../../shared/components/chart-widget/chart-widget.component';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ToastService } from '../../core/services/toast.service';
import type { AnalyticsSummary } from '../../core/models/analytics.model';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  standalone: true,
  imports: [MatIconModule, StatCardComponent, ChartWidgetComponent],
})
export class AnalyticsComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly summary = signal<AnalyticsSummary | null>(null);

  readonly monthly = computed(() => {
    const s = this.summary();
    if (!s) return { labels: [], predictions: [], highRisk: [] };
    return {
      labels: s.monthlyPredictions.map((m) => m.month),
      predictions: s.monthlyPredictions.map((m) => m.predictions),
      highRisk: s.monthlyPredictions.map((m) => m.highRisk),
    };
  });

  readonly riskDistribution = computed(() => {
    const s = this.summary();
    if (!s) return { labels: [], values: [], colors: [] as string[] };
    return {
      labels: s.riskDistribution.map((d) => d.label),
      values: s.riskDistribution.map((d) => d.value),
      colors: s.riskDistribution.map((d) => d.color),
    };
  });

  readonly genderDistribution = computed(() => {
    const s = this.summary();
    if (!s) return { labels: [], values: [] };
    return {
      labels: s.genderDistribution.map((g) => g.label),
      values: s.genderDistribution.map((g) => g.value),
    };
  });

  ngOnInit(): void {
    this.analytics.getAnalytics().subscribe({
      next: (s) => {
        this.summary.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Could not load analytics', 'Please try again.');
      },
    });
  }
}
