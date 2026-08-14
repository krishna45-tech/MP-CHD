// =============================================================================
// About page – mission, model explanation, privacy and team.
// =============================================================================
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService } from '../../core/services/theme.service';

interface Milestone {
  year: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
})
export class AboutComponent {
  readonly theme = inject(ThemeService);

  readonly milestones: Milestone[] = [
    { year: '2024', title: 'Research begins', text: 'Our clinical team starts modelling CHD risk from sleep, vitals and lifestyle data.' },
    { year: '2025', title: 'ML engine v1', text: 'First prototype achieves 89% AUC across 12,000 anonymised patient records.' },
    { year: '2025', title: 'CardioSight launches', text: 'Public beta opens with transparent, explainable risk scoring.' },
    { year: '2026', title: 'Sleep-first scoring', text: 'Sleep quality becomes a first-class predictor in the risk model.' },
  ];

  readonly modelFactors = [
    { icon: 'bedtime', title: 'Sleep health', text: 'Duration, quality and disorders such as apnea carry powerful predictive signal.' },
    { icon: 'bloodtype', title: 'Vital signs', text: 'Blood pressure, resting heart rate, cholesterol and glucose readings.' },
    { icon: 'self_improvement', title: 'Lifestyle', text: 'Exercise frequency, stress, smoking and alcohol habits.' },
    { icon: 'straighten', title: 'Body metrics', text: 'Age, gender, BMI and related anthropometric measures.' },
  ];

  readonly values = [
    { icon: 'shield', title: 'Explainable', text: 'Every score shows the factors driving it, so you always know the why.' },
    { icon: 'lock', title: 'Private by design', text: 'Your health data is encrypted, never sold, and you stay in control.' },
    { icon: 'science', title: 'Clinically informed', text: 'Built with cardiologists and validated against real patient cohorts.' },
  ];
}
