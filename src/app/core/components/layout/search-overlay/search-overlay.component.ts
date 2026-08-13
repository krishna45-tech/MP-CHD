// =============================================================================
// Global search overlay (Ctrl/Cmd-K or "/").
// =============================================================================
import { Component, ElementRef, HostListener, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, UpperCasePipe, DatePipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { UiService } from '../../../services/ui.service';
import { SearchService, GlobalSearchResult } from '../../../services/search.service';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { RiskClassPipe, RiskLabelPipe } from '../../../../shared/pipes/risk.pipe';

@Component({
  selector: 'app-search-overlay',
  template: `
    @if (ui.searchOpen()) {
      <div class="overlay" (click)="ui.closeSearch()">
        <div class="panel" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <div class="search-input-row">
            <mat-icon>search</mat-icon>
            <input
              #searchInput
              type="text"
              placeholder="Search patients, predictions, records…"
              [value]="query()"
              (input)="onInput($event)"
              (keydown)="onKeydown($event)"
              autocomplete="off"
            />
            <kbd>esc</kbd>
          </div>

          @if (loading()) {
            <div class="search-loading">
              <div class="spinner"></div>
            </div>
          } @else {
            <div class="results">
              @if (results().patients.length > 0) {
                <section class="group">
                  <h6 class="group-title">Patients</h6>
                  @for (p of results().patients; track p.id) {
                    <button class="result-row" (click)="go('/app/admin/users')">
                      <app-avatar [name]="p.firstName + ' ' + p.lastName" [color]="p.avatarColor" [size]="34"></app-avatar>
                      <span class="result-main">
                        <strong>{{ p.firstName }} {{ p.lastName }}</strong>
                        <em>{{ p.email }}</em>
                      </span>
                      <mat-icon class="go">arrow_forward</mat-icon>
                    </button>
                  }
                </section>
              }

              @if (results().predictions.length > 0) {
                <section class="group">
                  <h6 class="group-title">Predictions</h6>
                  @for (p of results().predictions; track p.id) {
                    <button class="result-row" (click)="go('/app/result/' + p.id)">
                      <span class="result-icon">
                        <mat-icon>monitor_heart</mat-icon>
                      </span>
                      <span class="result-main">
                        <strong>{{ p.patientName }} · {{ p.id | uppercase }}</strong>
                        <em>{{ p.submittedAt | date: 'MMM d, yyyy' }} · Risk {{ p.riskScore }}%</em>
                      </span>
                      <span class="risk-chip" [ngClass]="p.riskLevel | riskClass">{{ p.riskLevel | riskLabel }}</span>
                    </button>
                  }
                </section>
              }

              @if (query().trim() && results().patients.length === 0 && results().predictions.length === 0) {
                <div class="no-results">
                  <mat-icon>search_off</mat-icon>
                  <p>No results found for "{{ query() }}"</p>
                </div>
              }

              @if (!query().trim()) {
                <div class="hint">
                  <mat-icon>manage_search</mat-icon>
                  <p>Start typing to search across patients and prediction records.</p>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        z-index: 900;
        background: rgba(10, 15, 25, 0.55);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        padding: 12vh 20px 20px;
        animation: fade-in 0.18s ease both;
      }
      .panel {
        width: min(620px, 100%);
        height: fit-content;
        max-height: 70vh;
        background: var(--surface-elevated);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: scale-in 0.2s ease both;
      }
      .search-input-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 18px;
        border-bottom: 1px solid var(--border);
      }
      .search-input-row > mat-icon {
        color: var(--primary);
        font-size: 24px;
        height: 24px;
        width: 24px;
      }
      .search-input-row input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-family: inherit;
        font-size: 16px;
        color: var(--text-primary);
      }
      .search-input-row input::placeholder {
        color: var(--text-tertiary);
      }
      .search-input-row kbd {
        font-size: 11px;
        font-family: inherit;
        padding: 2px 8px;
        border-radius: 6px;
        border: 1px solid var(--border-strong);
        color: var(--text-tertiary);
      }
      .results {
        overflow-y: auto;
        padding: 8px;
      }
      .group-title {
        margin: 10px 12px 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-tertiary);
      }
      .result-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        text-align: left;
        padding: 10px 12px;
        border: none;
        background: transparent;
        border-radius: 12px;
        font-family: inherit;
        transition: background var(--transition);
      }
      .result-row:hover {
        background: var(--surface-muted);
      }
      .result-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .result-main strong {
        font-size: 13.5px;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .result-main em {
        font-style: normal;
        font-size: 12px;
        color: var(--text-tertiary);
      }
      .result-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--danger-soft);
        color: var(--primary);
        flex-shrink: 0;
      }
      .result-icon mat-icon {
        font-size: 20px;
        height: 20px;
        width: 20px;
      }
      .go {
        color: var(--text-tertiary);
        font-size: 18px;
        height: 18px;
        width: 18px;
      }
      .risk-chip {
        font-size: 11px;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
      }
      .search-loading {
        display: flex;
        justify-content: center;
        padding: 40px;
      }
      .spinner {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid var(--border);
        border-top-color: var(--primary);
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .no-results,
      .hint {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 40px 20px;
        color: var(--text-tertiary);
        text-align: center;
      }
      .no-results mat-icon,
      .hint mat-icon {
        font-size: 40px;
        height: 40px;
        width: 40px;
        opacity: 0.6;
      }
      .no-results p,
      .hint p {
        margin: 0;
        font-size: 13px;
      }
    `,
  ],
  standalone: true,
  imports: [MatIconModule, AvatarComponent, RiskLabelPipe, RiskClassPipe, NgClass, UpperCasePipe, DatePipe],
})
export class SearchOverlayComponent {
  private readonly search = inject(SearchService);
  private readonly router = inject(Router);
  private readonly querySubject = new Subject<string>();

  readonly ui = inject(UiService);
  readonly query = signal('');
  readonly loading = signal(false);
  readonly results = signal<GlobalSearchResult>({ patients: [], predictions: [], query: '' });

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    this.querySubject
      .pipe(
        debounceTime(240),
        distinctUntilChanged(),
        switchMap((term) => {
          this.query.set(term);
          if (!term.trim()) {
            this.loading.set(false);
            return of({ patients: [], predictions: [], query: term });
          }
          this.loading.set(true);
          return this.search.search(term);
        }),
      )
      .subscribe({
        next: (result) => {
          this.results.set(result);
          this.loading.set(false);
        },
      });

    effect(() => {
      if (this.ui.searchOpen()) {
        requestAnimationFrame(() => this.inputRef()?.nativeElement.focus());
      } else {
        this.querySubject.next('');
      }
    });
  }

  onInput(event: Event): void {
    this.querySubject.next((event.target as HTMLInputElement).value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.ui.closeSearch();
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.ui.searchOpen()) {
      this.ui.closeSearch();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.ui.openSearch();
    }
  }

  go(route: string): void {
    this.ui.closeSearch();
    this.router.navigate([route]);
  }
}
