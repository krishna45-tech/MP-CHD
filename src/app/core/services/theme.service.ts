// =============================================================================
// Light / dark theme manager (signals + localStorage + system preference).
// =============================================================================
import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'cardiosight_theme';
  private readonly dark = signal(this.loadInitialPreference());
  readonly isDark = this.dark.asReadonly();

  constructor() {
    effect(() => this.apply(this.dark()));
  }

  toggle(): void {
    this.dark.update((value) => !value);
  }

  setDark(value: boolean): void {
    this.dark.set(value);
  }

  private apply(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(this.storageKey, dark ? 'dark' : 'light');
  }

  private loadInitialPreference(): boolean {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
