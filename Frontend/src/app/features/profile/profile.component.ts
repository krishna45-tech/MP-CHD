// =============================================================================
// Profile page – personal details, health metrics, security (password change).
// =============================================================================
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { CircularProgressComponent } from '../../shared/components/circular-progress/circular-progress.component';
import type { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    AvatarComponent,
    CircularProgressComponent,
  ],
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profile = inject(ProfileService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly snackbar = inject(MatSnackBar);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly changingPassword = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    phone: [''],
    gender: ['male' as 'male' | 'female' | 'other'],
    dateOfBirth: [''],
    heightCm: [0, [Validators.required, Validators.min(120), Validators.max(230)]],
    weightKg: [0, [Validators.required, Validators.min(30), Validators.max(250)]],
    bloodGroup: [''],
    allergies: [''],
    medications: [''],
    medicalConditions: [''],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: (g) =>
      g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true },
    },
  );

  readonly bmi = computed(() => {
    const u = this.user();
    if (!u) return 0;
    const m = u.heightCm / 100;
    if (!m) return 0;
    return Math.round((u.weightKg / (m * m)) * 10) / 10;
  });

  readonly bmiLevel = computed(() => {
    const b = this.bmi();
    if (b >= 30) return { label: 'Obese', cls: 'high', color: '#E53935' };
    if (b >= 25) return { label: 'Overweight', cls: 'medium', color: '#F9A825' };
    if (b < 18.5) return { label: 'Underweight', cls: 'medium', color: '#F9A825' };
    return { label: 'Healthy', cls: 'low', color: '#43A047' };
  });

  readonly profileCompleteness = computed(() => {
    const u = this.user();
    if (!u) return 0;
    let filled = 0;
    const checks = [
      !!u.firstName && !!u.lastName,
      !!u.phone,
      !!u.dateOfBirth,
      !!u.bloodGroup,
      u.heightCm > 0,
      u.weightKg > 0,
      u.allergies.length > 0,
      u.medicalConditions.length > 0,
      u.medications.length > 0,
      u.isEmailVerified,
    ];
    filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  });

  ngOnInit(): void {
    this.profile.getProfile().subscribe({
      next: (u) => {
        this.user.set(u);
        this.patchForm(u);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Could not load profile', 'Please try again.');
      },
    });
  }

  patchForm(u: User): void {
    this.profileForm.patchValue({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      gender: u.gender,
      dateOfBirth: u.dateOfBirth,
      heightCm: u.heightCm,
      weightKg: u.weightKg,
      bloodGroup: u.bloodGroup,
      allergies: u.allergies.join(', '),
      medications: u.medications.join(', '),
      medicalConditions: u.medicalConditions.join(', '),
    });
  }

  toList(value: string): string[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    const v = this.profileForm.getRawValue();
    const payload: Partial<User> = {
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone,
      gender: v.gender,
      dateOfBirth: v.dateOfBirth,
      heightCm: v.heightCm,
      weightKg: v.weightKg,
      bloodGroup: v.bloodGroup,
      allergies: this.toList(v.allergies),
      medications: this.toList(v.medications),
      medicalConditions: this.toList(v.medicalConditions),
    };
    this.saving.set(true);
    this.profile
      .updateProfile(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.toast.success('Profile updated', 'Your changes have been saved.');
        },
        error: () => this.toast.error('Update failed', 'Could not save your profile.'),
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.changingPassword.set(true);
    this.profile
      .changePassword({
        currentPassword: this.passwordForm.controls.currentPassword.value,
        newPassword: this.passwordForm.controls.newPassword.value,
      })
      .pipe(finalize(() => this.changingPassword.set(false)))
      .subscribe({
        next: () => {
          this.snackbar.open('Password changed successfully', 'Close', { duration: 3000 });
          this.passwordForm.reset();
        },
        error: () => this.toast.error('Password change failed', 'Check your current password.'),
      });
  }
}
