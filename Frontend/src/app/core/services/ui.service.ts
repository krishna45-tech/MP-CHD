// =============================================================================
// Cross-cutting UI state (sidebar collapse, mobile drawer, search overlay).
// =============================================================================
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiService {
  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);
  readonly searchOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((value) => !value);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  openSearch(): void {
    this.searchOpen.set(true);
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }
}
