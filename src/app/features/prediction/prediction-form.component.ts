// =============================================================================
// Multi-step prediction form.
// Collects personal, lifestyle, clinical and sleep parameters, then calls the
// ML engine via PredictionService and navigates to the result page.
// =============================================================================
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgSwitch, NgSwitchCase, TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { finalize } from 'rxjs';
import { PredictionService } from '../../core/services/prediction.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import type { PredictionInput, SleepDisorder, Gender } from '../../core/models/prediction.model';
import type { RiskLevel } from '../../core/models/common.model';

interface Step {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  controls: string[];
}

const STEPS: Step[] = [
  { id: 1, icon: 'person', title: 'Personal information', subtitle: 'Age, gender and body metrics', controls: ['age', 'gender', 'weightKg', 'heightCm'] },
  { id: 2, icon: 'self_improvement', title: 'Lifestyle', subtitle: 'Habits that affect your heart', controls: ['smoking', 'alcohol', 'exerciseDaysPerWeek', 'stressLevel'] },
  { id: 3, icon: 'monitor_heart', title: 'Clinical parameters', subtitle: 'Latest lab and vital readings', controls: ['systolicBp', 'diastolicBp', 'cholesterol', 'glucose', 'heartRate'] },
  { id: 4, icon: 'bedtime', title: 'Sleep information', subtitle: 'Sleep quality and disorders', controls: ['sleepDurationHours', 'sleepQuality', 'sleepDisorder', 'snoring'] },
  { id: 5, icon: 'fact_check', title: 'Review & predict', subtitle: 'Confirm your inputs and run the analysis', controls: [] },
];

@Component({
  selector: 'app-prediction-form',
  templateUrl: './prediction-form.component.html',
  styleUrl: './prediction-form.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    TitleCasePipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatRadioModule,
  ],
})
export class PredictionFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly prediction = inject(PredictionService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly steps = STEPS;
  readonly currentStep = signal(1);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    // Personal
    age: [42, [Validators.required, Validators.min(18), Validators.max(100)]],
    gender: ['male' as Gender, Validators.required],
    weightKg: [72, [Validators.required, Validators.min(30), Validators.max(250)]],
    heightCm: [170, [Validators.required, Validators.min(120), Validators.max(230)]],
    // Lifestyle
    smoking: [false],
    alcohol: [false],
    alcoholLevel: ['none' as 'none' | 'light' | 'moderate' | 'heavy'],
    exerciseDaysPerWeek: [3, [Validators.min(0), Validators.max(7)]],
    stressLevel: [2 as 1 | 2 | 3 | 4 | 5],
    // Clinical
    systolicBp: [120, [Validators.required, Validators.min(70), Validators.max(260)]],
    diastolicBp: [80, [Validators.required, Validators.min(40), Validators.max(160)]],
    cholesterol: [190, [Validators.required, Validators.min(80), Validators.max(400)]],
    glucose: [95, [Validators.required, Validators.min(50), Validators.max(300)]],
    heartRate: [72, [Validators.required, Validators.min(35), Validators.max(220)]],
    // Sleep
    sleepDurationHours: [7, [Validators.required, Validators.min(3), Validators.max(12)]],
    sleepQuality: [3 as 1 | 2 | 3 | 4 | 5],
    sleepDisorder: ['none' as SleepDisorder, Validators.required],
    snoring: [false],
  });

  readonly bmi = computed(() => {
    const heightM = this.form.controls.heightCm.value / 100;
    if (!heightM) return 0;
    return Math.round((this.form.controls.weightKg.value / (heightM * heightM)) * 10) / 10;
  });

  readonly progress = computed(() => Math.round(((this.currentStep() - 1) / (STEPS.length - 1)) * 100));

  readonly isFirstStep = computed(() => this.currentStep() === 1);
  readonly isLastStep = computed(() => this.currentStep() === STEPS.length);

  stepFor(id: number): Step {
    return STEPS[id - 1];
  }

  isCurrent(id: number): boolean {
    return this.currentStep() === id;
  }

  isDone(id: number): boolean {
    return this.currentStep() > id;
  }

  goToStep(id: number): void {
    const target = STEPS[id - 1];
    if (id < this.currentStep() || this.validateControls(target.controls)) {
      this.currentStep.set(id);
    }
  }

  next(): void {
    const step = this.stepFor(this.currentStep());
    if (this.validateControls(step.controls)) {
      this.currentStep.update((v) => Math.min(v + 1, STEPS.length));
    }
  }

  back(): void {
    this.currentStep.update((v) => Math.max(v - 1, 1));
  }

  private validateControls(controls: string[]): boolean {
    if (controls.length === 0) return true;
    const controlsToValidate = controls
      .map((name) => this.form.get(name))
      .filter((c): c is NonNullable<typeof c> => c !== null);
    controlsToValidate.forEach((control) => control.markAsTouched());
    return controlsToValidate.every((control) => control.valid);
  }

  stressLabel(level: number): string {
    const labels = ['', 'Very low', 'Low', 'Moderate', 'High', 'Very high'];
    return labels[level] ?? '';
  }

  qualityLabel(level: number): string {
    const labels = ['', 'Very poor', 'Poor', 'Fair', 'Good', 'Excellent'];
    return labels[level] ?? '';
  }

  sleepHrsLabel(hours: number): string {
    return hours < 6 ? 'Insufficient' : hours > 9 ? 'Too long' : 'Optimal';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toast.error('Incomplete form', 'Please review all sections before predicting.');
      return;
    }

    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const input: PredictionInput = {
      age: raw.age,
      gender: raw.gender,
      weightKg: raw.weightKg,
      heightCm: raw.heightCm,
      bmi: this.bmi(),
      smoking: raw.smoking,
      alcohol: raw.alcohol,
      alcoholLevel: raw.alcoholLevel,
      exerciseDaysPerWeek: raw.exerciseDaysPerWeek,
      stressLevel: raw.stressLevel,
      systolicBp: raw.systolicBp,
      diastolicBp: raw.diastolicBp,
      cholesterol: raw.cholesterol,
      glucose: raw.glucose,
      heartRate: raw.heartRate,
      sleepDurationHours: raw.sleepDurationHours,
      sleepQuality: raw.sleepQuality,
      sleepDisorder: raw.sleepDisorder,
      snoring: raw.snoring,
    };

    this.prediction
      .predict(input)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (result) => {
          this.toast.success('Prediction complete', 'Your risk assessment is ready.');
          this.router.navigate(['/app/result', result.id]);
        },
      });
  }
}
