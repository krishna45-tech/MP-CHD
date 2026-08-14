// =============================================================================
// Dev-only helper that surfaces backend verification codes in the UI.
// The backend mints 6-digit codes but has no email provider wired up, so in
// development the code is returned in the response message. This service
// captures that message and lets the verify-email page display it.
//
// IMPORTANT: Guarded by environment.production – in production builds nothing
// is ever captured or rendered, keeping codes out of the UI.
// =============================================================================
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

const CODE_PATTERN = /\b\d{6}\b/;

@Injectable({ providedIn: 'root' })
export class DevCodeService {
  /** True outside production builds; codes are only surfaced while this is true. */
  readonly enabled = !environment.production;

  /** Latest backend message that carried a verification code (null otherwise). */
  readonly message = signal<string | null>(null);

  /** Capture a backend response message if it contains a verification code. */
  capture(backendMessage: string | null | undefined): void {
    if (!this.enabled || !backendMessage || !CODE_PATTERN.test(backendMessage)) {
      this.message.set(null);
      return;
    }
    this.message.set(backendMessage);
  }

  /** Extracts just the 6-digit code from the latest captured message, if any. */
  code(): string | null {
    const msg = this.message();
    if (!msg) return null;
    return msg.match(CODE_PATTERN)?.[0] ?? null;
  }

  clear(): void {
    this.message.set(null);
  }
}
