// =============================================================================
// Prediction history – searchable, filterable, paginated list of assessments.
// =============================================================================
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HistoryService } from '../../core/services/history.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import type { RiskLevel } from '../../core/models/common.model';
import type { PaginatedResponse } from '../../core/models/common.model';
import type { PredictionRecord } from '../../core/models/prediction.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatTooltipModule,
    EmptyStateComponent,
  ],
})
export class HistoryComponent implements OnInit {
  private readonly history = inject(HistoryService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly search = new FormControl('');
  readonly riskFilter = new FormControl<'all' | RiskLevel>('all');
  readonly sortBy = new FormControl<'submittedAt' | 'riskScore'>('submittedAt');

  readonly loading = signal(true);
  readonly records = signal<PredictionRecord[]>([]);
  readonly page = signal(1);
  readonly pageSize = 8;
  readonly total = signal(0);
  readonly totalPages = signal(1);

  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.search.valueChanges.subscribe(() => {
      this.page.set(1);
      this.reload();
    });
    this.riskFilter.valueChanges.subscribe(() => {
      this.page.set(1);
      this.reload();
    });
    this.sortBy.valueChanges.subscribe(() => this.reload());
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.history
      .list({
        page: this.page(),
        pageSize: this.pageSize,
        search: this.search.value ?? undefined,
        risk: this.riskFilter.value === 'all' ? undefined : (this.riskFilter.value ?? undefined),
        sortBy: this.sortBy.value ?? 'submittedAt',
        sortDir: 'desc',
      })
      .subscribe({
        next: (res: PaginatedResponse<PredictionRecord>) => {
          this.records.set(res.items);
          this.total.set(res.total);
          this.totalPages.set(res.totalPages);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('Could not load history', 'Please try again.');
        },
      });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.reload();
  }

  setRiskFilter(value: string): void {
    this.riskFilter.setValue(value === 'all' ? 'all' : (value as 'low' | 'medium' | 'high'));
    this.page.set(1);
    this.reload();
  }

  openResult(r: PredictionRecord): void {
    this.router.navigate(['/app/result', r.id]);
  }

  deleteRecord(r: PredictionRecord): void {
    this.history.delete(r.id).subscribe(() => {
      this.toast.success('Record deleted', `Prediction ${r.id} was removed.`);
      this.reload();
    });
  }
}
