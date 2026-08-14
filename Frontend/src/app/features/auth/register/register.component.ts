// =============================================================================
// Registration page.
// =============================================================================
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { PasswordStrengthComponent } from '../password-strength/password-strength.component';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-card">
      <a class="mobile-brand" routerLink="/landing">
        <span class="brand-dot"><mat-icon>monitor_heart</mat-icon></span>
        Cardio<em>Sight</em>
      </a>

      <span class="eyebrow">Get started</span>
      <h1 class="title">Create your account</h1>
      <p class="subtitle">Join CardioSight and take control of your heart health today.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
        <div class="two-col">
          <mat-form-field appearance="outline" class="field">
            <mat-label>First name</mat-label>
            <mat-icon matPrefix>badge</mat-icon>
            <input matInput formControlName="firstName" placeholder="Aarav" autocomplete="given-name" />
            <mat-error *ngIf="form.controls.firstName.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Last name</mat-label>
            <mat-icon matPrefix>badge</mat-icon>
            <input matInput formControlName="lastName" placeholder="Sharma" autocomplete="family-name" />
            <mat-error *ngIf="form.controls.lastName.hasError('required')">Required</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Email address</mat-label>
          <mat-icon matPrefix>mail_outline</mat-icon>
          <input matInput type="email" formControlName="email" placeholder="you@example.com" autocomplete="email" />
          <mat-error *ngIf="form.controls.email.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="form.controls.email.hasError('email')">Enter a valid email</mat-error>
        </mat-form-field>

        <div class="two-col">
          <mat-form-field appearance="outline" class="field">
            <mat-label>Phone (optional)</mat-label>
            <mat-icon matPrefix>phone</mat-icon>
            <input matInput formControlName="phone" placeholder="+91 …" autocomplete="tel" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Gender</mat-label>
            <mat-icon matPrefix>wc</mat-icon>
            <mat-select formControlName="gender">
              <mat-option value="male">Male</mat-option>
              <mat-option value="female">Female</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Password</mat-label>
          <mat-icon matPrefix>lock_outline</mat-icon>
          <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Create a strong password" autocomplete="new-password" />
          <button mat-icon-button matSuffix type="button" (click)="togglePassword()" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
            <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="form.controls.password.hasError('required')">Password is required</mat-error>
          <mat-error *ngIf="form.controls.password.hasError('minlength')">At least 8 characters</mat-error>
        </mat-form-field>
        <app-password-strength [password]="form.controls.password.value"></app-password-strength>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Confirm password</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="confirmPassword" placeholder="Repeat your password" autocomplete="new-password" />
          <mat-error *ngIf="form.controls.confirmPassword.hasError('required')">Please confirm your password</mat-error>
          <mat-error *ngIf="form.controls.confirmPassword.hasError('mismatch')">Passwords do not match</mat-error>
        </mat-form-field>

        <mat-checkbox formControlName="acceptTerms" color="primary" class="terms">
          I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </mat-checkbox>

        <button mat-flat-button color="primary" class="submit" [disabled]="submitting() || form.invalid" type="submit">
          @if (submitting()) {
            <span class="spinner"></span> Creating account…
          } @else {
            Create account
          }
        </button>
      </form>

      <p class="switch">
        Already have an account?
        <a routerLink="/auth/login" class="link">Sign in</a>
      </p>
    </div>
  `,
  styles: [
    `
      .auth-card {
        animation: fade-in-up 0.45s ease both;
      }
      .mobile-brand {
        display: none;
        align-items: center;
        gap: 10px;
        font-size: 19px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 30px;

        @media (max-width: 1020px) {
          display: flex;
        }

        em {
          font-style: normal;
          color: var(--primary);
        }
      }
      .brand-dot {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }
      .eyebrow {
        display: inline-block;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--primary);
        margin-bottom: 10px;
      }
      .title {
        font-size: 28px;
        margin-bottom: 8px;
      }
      .subtitle {
        color: var(--text-secondary);
        margin: 0 0 26px;
      }
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;

        @media (max-width: 480px) {
          grid-template-columns: 1fr;
        }
      }
      .field {
        width: 100%;
      }
      .terms {
        margin: 14px 0 20px;
        font-size: 12.5px;

        a {
          color: var(--secondary);
          font-weight: 500;
        }
      }
      .submit {
        width: 100%;
        padding: 22px 0;
        border-radius: 14px;
        font-size: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .spinner {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2.5px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .switch {
        margin-top: 24px;
        text-align: center;
        font-size: 13.5px;
        color: var(--text-secondary);

        a {
          color: var(--primary);
          font-weight: 600;
        }
      }
    `,
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    PasswordStrengthComponent,
  ],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      gender: ['male' as 'male' | 'female' | 'other'],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: (control) => (control.value.password === control.value.confirmPassword ? null : { mismatch: true }) },
  );

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const { firstName, lastName, email, phone, gender, password } = this.form.getRawValue();

    this.auth
      .register({ firstName, lastName, email, password, phone, gender })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Account created!', 'Verify your email to get started.');
          this.router.navigate(['/auth/verify-email'], { queryParams: { email } });
        },
      });
  }
}
