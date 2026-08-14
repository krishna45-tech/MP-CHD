// =============================================================================
// Login page.
// =============================================================================
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-card">
      <a class="mobile-brand" routerLink="/landing">
        <span class="brand-dot"><mat-icon>monitor_heart</mat-icon></span>
        Cardio<em>Sight</em>
      </a>

      <span class="eyebrow">Welcome back</span>
      <h1 class="title">Sign in to CardioSight</h1>
      <p class="subtitle">Access your heart health dashboard and run new predictions.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
        <mat-form-field appearance="outline" class="field">
          <mat-label>Email address</mat-label>
          <mat-icon matPrefix>mail_outline</mat-icon>
          <input matInput type="email" formControlName="email" placeholder="you@example.com" autocomplete="email" />
          <mat-error *ngIf="form.controls.email.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="form.controls.email.hasError('email')">Enter a valid email</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Password</mat-label>
          <mat-icon matPrefix>lock_outline</mat-icon>
          <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" autocomplete="current-password" />
          <button mat-icon-button matSuffix type="button" (click)="togglePassword()" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
            <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="form.controls.password.hasError('required')">Password is required</mat-error>
        </mat-form-field>

        <div class="row-between">
          <mat-checkbox formControlName="rememberMe" color="primary">Remember me</mat-checkbox>
          <a routerLink="/auth/forgot-password" class="link">Forgot password?</a>
        </div>

        <button mat-flat-button color="primary" class="submit" [disabled]="submitting() || form.invalid" type="submit">
          @if (submitting()) {
            <span class="spinner"></span> Signing in…
          } @else {
            Sign in
          }
        </button>
      </form>

      <div class="demo-card">
        <div class="demo-head">
          <mat-icon>science</mat-icon>
          <strong>Demo credentials</strong>
        </div>
        <p>Patient: <code>aarav.sharma&#64;demo.com</code></p>
        <p>Admin: <code>admin&#64;cardiosight.demo</code></p>
        <p class="hint">Any password works in demo mode.</p>
      </div>

      <p class="switch">
        New to CardioSight?
        <a routerLink="/auth/register" class="link strong">Create an account</a>
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
        margin: 0 0 28px;
      }
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .field {
        width: 100%;
      }
      .row-between {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 8px 0 22px;
        font-size: 13px;
      }
      .link {
        color: var(--secondary);
        font-weight: 500;
        font-size: 13px;
      }
      .link:hover {
        color: var(--primary);
      }
      .link.strong {
        color: var(--primary);
        font-weight: 600;
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
      .demo-card {
        margin-top: 26px;
        padding: 16px 18px;
        border-radius: 16px;
        background: var(--info-soft);
        border: 1px solid var(--border);
        font-size: 13px;
        color: var(--text-secondary);
      }
      .demo-head {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--secondary);
        margin-bottom: 8px;

        strong {
          font-size: 13px;
        }

        mat-icon {
          font-size: 18px;
          height: 18px;
          width: 18px;
        }
      }
      .demo-card p {
        margin: 4px 0;
      }
      .demo-card code {
        font-family: 'Poppins', monospace;
        background: var(--surface);
        padding: 1px 7px;
        border-radius: 6px;
        font-size: 12px;
        color: var(--text-primary);
      }
      .demo-card .hint {
        margin-top: 8px;
        font-size: 11.5px;
        color: var(--text-tertiary);
      }
      .switch {
        margin-top: 26px;
        text-align: center;
        font-size: 13.5px;
        color: var(--text-secondary);
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
    MatCheckboxModule,
    MatButtonModule,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const { email, password, rememberMe } = this.form.getRawValue();

    this.auth
      .login({ email, password, rememberMe })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
          const name = response.user.firstName;
          this.toast.success(`Welcome back, ${name}!`, 'You have signed in successfully.');
          const returnUrl = this.router.routerState.snapshot.root.queryParamMap.get('returnUrl');
          this.router.navigate([returnUrl ?? '/app/dashboard']);
        },
      });
  }
}
