// =============================================================================
// Email verification page.
// =============================================================================
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-verify-email',
  template: `
    <div class="auth-card">
      <a class="mobile-brand" routerLink="/landing">
        <span class="brand-dot"><mat-icon>monitor_heart</mat-icon></span>
        Cardio<em>Sight</em>
      </a>

      <div class="verify-icon"><mat-icon>verified_user</mat-icon></div>
      <span class="eyebrow">Email validation</span>
      <h1 class="title">Verify your email</h1>
      <p class="subtitle">
        We sent a 6-digit verification code to
        <strong>{{ email() }}</strong>. Enter it below to activate your account.
      </p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
        <mat-form-field appearance="outline" class="field">
          <mat-label>Verification code</mat-label>
          <mat-icon matPrefix>pin</mat-icon>
          <input matInput formControlName="code" placeholder="e.g. 482913" maxlength="6" inputmode="numeric" />
          <mat-error *ngIf="form.controls.code.hasError('required')">Code is required</mat-error>
          <mat-error *ngIf="form.controls.code.hasError('pattern')">Enter a valid 6-digit code</mat-error>
        </mat-form-field>

        <button mat-flat-button color="primary" class="submit" [disabled]="submitting() || form.invalid" type="submit">
          @if (submitting()) {
            <span class="spinner"></span> Verifying…
          } @else {
            Verify email
          }
        </button>
      </form>

      <button class="resend" [disabled]="resending()" (click)="resend()">
        @if (resending()) {
          Resending…
        } @else {
          Resend code
        }
      </button>

      <p class="switch">
        <a routerLink="/auth/login" class="link">Skip for now · Go to sign in</a>
      </p>
    </div>
  `,
  styles: [
    `
      .auth-card { animation: fade-in-up 0.45s ease both; text-align: center; }
      .mobile-brand {
        display: none; align-items: center; gap: 10px; font-size: 19px; font-weight: 700;
        color: var(--text-primary); margin-bottom: 30px; text-align: left;
        @media (max-width: 1020px) { display: flex; }
        em { font-style: normal; color: var(--primary); }
      }
      .brand-dot {
        width: 38px; height: 38px; border-radius: 12px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex; align-items: center; justify-content: center; color: #fff;
      }
      .verify-icon {
        width: 76px; height: 76px; margin: 0 auto 18px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: var(--success-soft); color: var(--success);
        mat-icon { font-size: 40px; height: 40px; width: 40px; }
      }
      .eyebrow {
        display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.14em;
        text-transform: uppercase; color: var(--primary); margin-bottom: 10px;
      }
      .title { font-size: 28px; margin-bottom: 8px; }
      .subtitle {
        color: var(--text-secondary); margin: 0 0 26px; font-size: 13.5px;
        strong { color: var(--text-primary); }
      }
      .auth-form { display: flex; flex-direction: column; gap: 6px; text-align: left; }
      .field { width: 100%; }
      .submit {
        width: 100%; padding: 22px 0; border-radius: 14px; font-size: 15px; font-weight: 600;
        display: flex; align-items: center; justify-content: center; gap: 10px;
      }
      .spinner {
        width: 18px; height: 18px; border-radius: 50%;
        border: 2.5px solid rgba(255,255,255,0.4); border-top-color: #fff;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .resend {
        margin-top: 16px; border: none; background: transparent;
        color: var(--secondary); font-weight: 600; font-size: 13px; font-family: inherit;
        &:hover { text-decoration: underline; }
        &:disabled { opacity: 0.5; }
      }
      .switch {
        margin-top: 22px; text-align: center; font-size: 13px; color: var(--text-secondary);
        .link { color: var(--secondary); font-weight: 500; }
      }
    `,
  ],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
})
export class VerifyEmailComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly resending = signal(false);
  readonly email = signal(this.route.snapshot.queryParamMap.get('email') ?? '');

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.auth
      .verifyEmail({ token: this.form.getRawValue().code })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Email verified', 'Your account is now fully active.');
          this.router.navigate(['/auth/login']);
        },
      });
  }

  resend(): void {
    this.resending.set(true);
    this.auth
      .forgotPassword({ email: this.email() })
      .pipe(finalize(() => this.resending.set(false)))
      .subscribe({
        next: () => this.toast.info('Code sent', `A fresh verification code was sent to ${this.email()}.`),
      });
  }
}
