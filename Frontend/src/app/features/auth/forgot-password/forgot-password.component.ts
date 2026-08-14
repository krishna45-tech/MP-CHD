// =============================================================================
// Forgot password page.
// =============================================================================
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  template: `
    <div class="auth-card">
      <a class="mobile-brand" routerLink="/landing">
        <span class="brand-dot"><mat-icon>monitor_heart</mat-icon></span>
        Cardio<em>Sight</em>
      </a>

      @if (!sent()) {
        <span class="eyebrow">Reset password</span>
        <h1 class="title">Forgot your password?</h1>
        <p class="subtitle">Enter your registered email and we will send you a secure reset link.</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="field">
            <mat-label>Email address</mat-label>
            <mat-icon matPrefix>mail_outline</mat-icon>
            <input matInput type="email" formControlName="email" placeholder="you@example.com" autocomplete="email" />
            <mat-error *ngIf="form.controls.email.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="form.controls.email.hasError('email')">Enter a valid email</mat-error>
          </mat-form-field>

          <button mat-flat-button color="primary" class="submit" [disabled]="submitting() || form.invalid" type="submit">
            @if (submitting()) {
              <span class="spinner"></span> Sending link…
            } @else {
              Send reset link
            }
          </button>
        </form>

        <p class="switch">
          Remembered your password?
          <a routerLink="/auth/login" class="link">Back to sign in</a>
        </p>
      } @else {
        <div class="success">
          <div class="success-icon"><mat-icon>mail</mat-icon></div>
          <h1 class="title">Check your inbox</h1>
          <p class="subtitle">
            If an account exists for <strong>{{ submittedEmail() }}</strong>, a password
            reset link is on its way. It expires in 30 minutes.
          </p>
          <button mat-flat-button color="primary" class="submit" (click)="sent.set(false)">
            Resend email
          </button>
          <p class="switch">
            <a routerLink="/auth/login" class="link">Back to sign in</a>
          </p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .auth-card { animation: fade-in-up 0.45s ease both; }
      .mobile-brand {
        display: none; align-items: center; gap: 10px; font-size: 19px; font-weight: 700;
        color: var(--text-primary); margin-bottom: 30px;
        @media (max-width: 1020px) { display: flex; }
        em { font-style: normal; color: var(--primary); }
      }
      .brand-dot {
        width: 38px; height: 38px; border-radius: 12px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex; align-items: center; justify-content: center; color: #fff;
      }
      .eyebrow {
        display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.14em;
        text-transform: uppercase; color: var(--primary); margin-bottom: 10px;
      }
      .title { font-size: 28px; margin-bottom: 8px; }
      .subtitle { color: var(--text-secondary); margin: 0 0 26px; }
      .auth-form { display: flex; flex-direction: column; gap: 6px; }
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
      .switch {
        margin-top: 24px; text-align: center; font-size: 13.5px; color: var(--text-secondary);
        .link { color: var(--primary); font-weight: 600; }
      }
      .success { text-align: center; }
      .success-icon {
        width: 72px; height: 72px; margin: 0 auto 18px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: var(--success-soft); color: var(--success);
        mat-icon { font-size: 36px; height: 36px; width: 36px; }
      }
      .success .submit { margin-top: 10px; }
      .success strong { color: var(--text-primary); }
    `,
  ],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly submitting = signal(false);
  readonly sent = signal(false);
  readonly submittedEmail = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const email = this.form.getRawValue().email;
    this.auth
      .forgotPassword({ email })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe(() => {
        this.submittedEmail.set(email);
        this.sent.set(true);
      });
  }
}
