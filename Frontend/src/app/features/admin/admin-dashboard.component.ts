// =============================================================================
// Admin dashboard – platform KPIs, risk distribution and activity feed.
// =============================================================================
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ChartWidgetComponent } from '../../shared/components/chart-widget/chart-widget.component';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import type { AdminActivity, AdminStats } from '../../core/models/analytics.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    StatCardComponent,
    ChartWidgetComponent,
  ],
})
export class AdminDashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly stats = signal<AdminStats | null>(null);
  readonly activities = signal<AdminActivity[]>([]);

  readonly riskDistribution = computed(() => {
    const s = this.stats();
    if (!s) return { labels: [], values: [] };
    const high = s.highRiskPredictions;
    const low = Math.max(0, s.totalPredictions - high - Math.round(s.avgRiskScore * 0.2));
    const medium = Math.max(0, s.totalPredictions - high - low);
    return {
      labels: ['Low', 'Medium', 'High'],
      values: [low, medium, high],
    };
  });

  ngOnInit(): void {
    this.admin.getStats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Could not load stats', 'Please try again.');
      },
    });
    this.admin.getActivities().subscribe({
      next: (acts) => this.activities.set(acts),
    });
  }
}
