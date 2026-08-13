// =============================================================================
// Notification centre – keeps unread state shared between topbar + dashboard.
// =============================================================================
import { Injectable, inject, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_NOTIFICATIONS } from '../data/mock-data';
import type { AppNotification } from '../models/health.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);
  private readonly items = signal<AppNotification[]>([]);
  private readonly loaded = signal(false);

  readonly notifications = this.items.asReadonly();
  readonly unreadCount = signal(0);

  load(): Observable<AppNotification[]> {
    if (this.loaded()) return of(this.items());
    const source = environment.useMock
      ? of(MOCK_NOTIFICATIONS).pipe(delay(400))
      : this.api.get<AppNotification[]>('/dashboard/notifications');
    return source;
  }

  seed(): void {
    if (!this.loaded()) {
      this.items.set(MOCK_NOTIFICATIONS);
      this.unreadCount.set(MOCK_NOTIFICATIONS.filter((n) => !n.read).length);
      this.loaded.set(true);
    }
  }

  replace(items: AppNotification[]): void {
    this.items.set(items);
    this.refreshUnread();
    this.loaded.set(true);
  }

  markAsRead(id: string): void {
    this.items.update((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    this.refreshUnread();
  }

  markAllAsRead(): void {
    this.items.update((list) => list.map((n) => ({ ...n, read: true })));
    this.refreshUnread();
  }

  private refreshUnread(): void {
    this.unreadCount.set(this.items().filter((n) => !n.read).length);
  }
}
