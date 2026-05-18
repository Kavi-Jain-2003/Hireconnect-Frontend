import { Component, OnInit, signal, computed } from '@angular/core';
import { AdminService, AdminUser } from '../../../core/services/admin.service';

@Component({
  standalone: false,
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  loading = signal(true);
  actionLoading = signal<number | null>(null);
  error = signal('');
  successMsg = signal('');
  searchTerm = signal('');
  roleFilter = signal('');
  statusFilter = signal('');
  deleteTargetId = signal<number | null>(null);

  filtered = computed(() => {
    const term   = this.searchTerm().toLowerCase();
    const role   = this.roleFilter();
    const status = this.statusFilter();
    return this.users().filter(u => {
      const matchSearch = !term   || u.email.toLowerCase().includes(term);
      const matchRole   = !role   || u.role === role;
      const matchStatus = status === '' ? true : status === 'active' ? !u.suspended : u.suspended;
      return matchSearch && matchRole && matchStatus;
    });
  });

  constructor(private adminSvc: AdminService) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading.set(true);
    this.adminSvc.getAllUsers().subscribe({
      next: (users: AdminUser[]) => { this.users.set(users); this.loading.set(false); },
      error: () => { this.error.set('Failed to load users.'); this.loading.set(false); }
    });
  }

  suspend(user: AdminUser): void {
    this.actionLoading.set(user.userId);
    this.clearMessages();
    this.adminSvc.suspendUser(user.userId).subscribe({
      next: () => {
        this.users.update(users => users.map(u => u.userId === user.userId ? { ...u, suspended: true } : u));
        this.successMsg.set(`${user.email} has been suspended.`);
        this.actionLoading.set(null);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message || 'Failed to suspend user.');
        this.actionLoading.set(null);
      }
    });
  }

  unsuspend(user: AdminUser): void {
    this.actionLoading.set(user.userId);
    this.clearMessages();
    this.adminSvc.unsuspendUser(user.userId).subscribe({
      next: () => {
        this.users.update(users => users.map(u => u.userId === user.userId ? { ...u, suspended: false } : u));
        this.successMsg.set(`${user.email} has been reactivated.`);
        this.actionLoading.set(null);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message || 'Failed to unsuspend user.');
        this.actionLoading.set(null);
      }
    });
  }

  confirmDelete(userId: number): void { this.deleteTargetId.set(userId); }
  cancelDelete(): void { this.deleteTargetId.set(null); }

  deleteUser(): void {
    const id = this.deleteTargetId();
    if (!id) return;
    this.actionLoading.set(id);
    this.clearMessages();
    this.adminSvc.deleteUser(id).subscribe({
      next: () => {
        this.users.update(users => users.filter(u => u.userId !== id));
        this.successMsg.set('User deleted successfully.');
        this.deleteTargetId.set(null);
        this.actionLoading.set(null);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message || 'Failed to delete user.');
        this.deleteTargetId.set(null);
        this.actionLoading.set(null);
      }
    });
  }

  clearMessages(): void { this.error.set(''); this.successMsg.set(''); }

  roleBadge(role: string): string {
    return role === 'RECRUITER' ? 'badge-amber' : role === 'ADMIN' ? 'badge-navy' : 'badge-teal';
  }
}
