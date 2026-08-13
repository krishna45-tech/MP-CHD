// =============================================================================
// Admin user management – search, inspect and suspend/delete accounts.
// =============================================================================
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import type { AdminUserRow } from '../../core/models/analytics.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTooltipModule,
    AvatarComponent,
    EmptyStateComponent,
  ],
})
export class AdminUsersComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);

  readonly search = new FormControl('');
  readonly loading = signal(true);
  readonly users = signal<AdminUserRow[]>([]);

  ngOnInit(): void {
    this.search.valueChanges.subscribe((q) => this.reload(q ?? ''));
    this.reload();
  }

  reload(query = ''): void {
    this.loading.set(true);
    this.admin.getUsers(query).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Could not load users', 'Please try again.');
      },
    });
  }

  suspend(user: AdminUserRow): void {
    this.toast.success('User suspended', `${user.firstName} ${user.lastName} was suspended.`);
  }

  delete(user: AdminUserRow): void {
    this.admin.deleteUser(user.id).subscribe(() => {
      this.toast.success('User removed', `${user.firstName} ${user.lastName} was deleted.`);
      this.reload(this.search.value ?? '');
    });
  }

  statusClass(status: string): string {
    return status;
  }
}
