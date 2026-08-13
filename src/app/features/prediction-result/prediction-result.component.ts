// =============================================================================
// Prediction result page – displays the ML risk score, confidence, contributing
// factors and actionable recommendations for a single prediction.
// =============================================================================
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RiskMeterComponent } from '../../shared/components/risk-meter/risk-meter.component';
import { CircularProgressComponent } from '../../shared/components/circular-progress/circular-progress.component';
import { PredictionService } from '../../core/services/prediction.service';
import { ToastService } from '../../core/services/toast.service';
import type { FactorContribution, PredictionResult } from '../../core/models/prediction.model';

@Component({
  selector: 'app-prediction-result',
  templateUrl: './prediction-result.component.html',
  styleUrl: './prediction-result.component.scss',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RiskMeterComponent,
    CircularProgressComponent,
  ],
})
export class PredictionResultComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly prediction = inject(PredictionService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly result = signal<PredictionResult | null>(null);

  readonly meterColor: Record<string, string> = {
    low: '#43A047',
    medium: '#F9A825',
    high: '#E53935',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.prediction.getResult(id).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Result unavailable', 'We could not load this prediction.');
      },
    });
  }

  factorWidth(f: FactorContribution): string {
    return `${Math.min(100, Math.abs(f.impact) * 100)}%`;
  }

  factorBarClass(f: FactorContribution): string {
    if (f.impact > 0.2) return 'negative';
    if (f.impact < -0.2) return 'positive';
    return 'neutral';
  }

  metricSummary(): string {
    const r = this.result();
    if (!r) return '';
    const { systolicBp, diastolicBp, cholesterol, glucose } = r.input;
    return `${systolicBp}/${diastolicBp} BP · ${cholesterol} mg/dL cholesterol · ${glucose} mg/dL glucose`;
  }

  downloadReport(): void {
    const r = this.result();
    if (!r) return;
    const payload = {
      id: r.id,
      riskScore: r.riskScore,
      riskLevel: r.riskLevel,
      confidence: r.confidence,
      recommendations: r.recommendations,
      factors: r.contributingFactors,
      submittedAt: r.submittedAt,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardiosight-result-${r.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Report downloaded', 'Your JSON report has been saved.');
  }

  shareReport(): void {
    const r = this.result();
    if (!r) return;
    const text = `My CardioSight heart risk score is ${r.riskScore}/100 (${r.riskLevel.toUpperCase()}). Assessed at ${r.submittedAt}.`;
    if (navigator.share) {
      navigator.share({ title: 'CardioSight result', text }).catch(() => undefined);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.toast.success('Copied to clipboard', 'Share this summary with your clinician.');
    }
  }
}
