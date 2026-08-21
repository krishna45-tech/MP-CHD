import { Component, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { NgSwitch, NgSwitchCase } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { finalize } from "rxjs";

import { PredictionService } from "../../core/services/prediction.service";
import { ToastService } from "../../core/services/toast.service";
import type { PredictionInput } from "../../core/models/prediction.model";

interface Step {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  controls: string[];
}

const STEPS: Step[] = [
  {
    id: 1,
    icon: "person",
    title: "Personal",
    subtitle: "Age, sex and education",
    controls: ["age", "male", "education"],
  },
  {
    id: 2,
    icon: "smoking_rooms",
    title: "Lifestyle",
    subtitle: "Smoking information",
    controls: ["currentSmoker", "cigsPerDay"],
  },
  {
    id: 3,
    icon: "medical_services",
    title: "Medical History",
    subtitle: "Existing conditions",
    controls: ["BPMeds", "prevalentStroke", "prevalentHyp", "diabetes"],
  },
  {
    id: 4,
    icon: "monitor_heart",
    title: "Clinical",
    subtitle: "Measurements",
    controls: ["totChol", "sysBP", "diaBP", "BMI", "heartRate", "glucose"],
  },
  {
    id: 5,
    icon: "fact_check",
    title: "Review",
    subtitle: "Confirm details",
    controls: [],
  },
];

@Component({
  selector: "app-prediction-form",
  templateUrl: "./prediction-form.component.html",
  styleUrl: "./prediction-form.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSwitch,
    NgSwitchCase,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
})
export class PredictionFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly prediction = inject(PredictionService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly steps = STEPS;
  readonly currentStep = signal(1);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    age: [50, [Validators.required, Validators.min(18), Validators.max(100)]],

    male: [1 as 0 | 1, Validators.required],

    education: [
      2 as 1 | 2 | 3 | 4,
      [Validators.required, Validators.min(1), Validators.max(4)],
    ],

    currentSmoker: [0 as 0 | 1],

    cigsPerDay: [
      0,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],

    BPMeds: [0 as 0 | 1],

    prevalentStroke: [0 as 0 | 1],

    prevalentHyp: [0 as 0 | 1],

    diabetes: [0 as 0 | 1],

    totChol: [
      200,
      [Validators.required, Validators.min(80), Validators.max(400)],
    ],

    sysBP: [
      120,
      [Validators.required, Validators.min(70), Validators.max(260)],
    ],

    diaBP: [80, [Validators.required, Validators.min(40), Validators.max(160)]],

    BMI: [25, [Validators.required, Validators.min(10), Validators.max(70)]],

    heartRate: [
      75,
      [Validators.required, Validators.min(35), Validators.max(220)],
    ],

    glucose: [
      100,
      [Validators.required, Validators.min(40), Validators.max(400)],
    ],
  });

  readonly progress = computed(() =>
    Math.round(((this.currentStep() - 1) / (STEPS.length - 1)) * 100)
  );

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
    const target = this.stepFor(id);

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
    if (controls.length === 0) {
      return true;
    }

    const controlsToValidate = controls
      .map((name) => this.form.get(name))
      .filter((control) => control !== null);

    controlsToValidate.forEach((control) => control!.markAsTouched());

    return controlsToValidate.every((control) => control!.valid);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toast.error(
        "Incomplete form",
        "Please review all sections before predicting."
      );
      return;
    }

    const sysBP = this.form.controls.sysBP.value;

    const diaBP = this.form.controls.diaBP.value;

    if (diaBP >= sysBP) {
      this.toast.error(
        "Invalid blood pressure",
        "Diastolic BP must be lower than systolic BP."
      );
      return;
    }

    this.submitting.set(true);

    const raw = this.form.getRawValue();

    const input: PredictionInput = {
      male: raw.male as 0 | 1,
      age: raw.age,
      education: raw.education as 1 | 2 | 3 | 4,

      currentSmoker: raw.currentSmoker as 0 | 1,

      cigsPerDay: raw.cigsPerDay,

      BPMeds: raw.BPMeds as 0 | 1,

      prevalentStroke: raw.prevalentStroke as 0 | 1,

      prevalentHyp: raw.prevalentHyp as 0 | 1,

      diabetes: raw.diabetes as 0 | 1,

      totChol: raw.totChol,

      sysBP: raw.sysBP,

      diaBP: raw.diaBP,

      BMI: raw.BMI,

      heartRate: raw.heartRate,

      glucose: raw.glucose,
    };

    this.prediction
      .predict(input)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (result) => {
          this.toast.success(
            "Prediction complete",
            "Your Framingham risk assessment is ready."
          );

          this.router.navigate(["/app/result", result.id]);
        },

        error: (error) => {
          console.error("Prediction error:", error);

          this.toast.error(
            "Prediction failed",
            "Unable to connect to the ML server."
          );
        },
      });
  }
}
