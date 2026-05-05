import { Component, OnInit } from '@angular/core';
import { AdminService, AdminUser } from '../../../core/services/admin.service';

@Component({
  standalone: false,
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  filtered: AdminUser[] = [];
  loading = true;
  actionLoading: number | null = null;
  error = '';
  successMsg = '';

  searchTerm = '';
  roleFilter = '';
  statusFilter = '';

  deleteTargetId: number | null = null;

  constructor(private adminSvc: AdminService) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;
    this.adminSvc.getAllUsers().subscribe({
      next: (users: AdminUser[]) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load users.'; this.loading = false; }
    });
  }

  applyFilters(): void {
    this.filtered = this.users.filter(u => {
      const matchSearch = !this.searchTerm ||
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchRole   = !this.roleFilter || u.role === this.roleFilter;
      const matchStatus = this.statusFilter === ''
        ? true
        : this.statusFilter === 'active' ? !u.suspended : u.suspended;
      return matchSearch && matchRole && matchStatus;
    });
  }

  suspend(user: AdminUser): void {
    this.actionLoading = user.userId;
    this.clearMessages();
    this.adminSvc.suspendUser(user.userId).subscribe({
      next: () => {
        user.suspended = true;
        this.applyFilters();
        this.successMsg = `${user.email} has been suspended.`;
        this.actionLoading = null;
      },
      error: (err: { error?: { message?: string } }) => {
        this.error = err.error?.message || 'Failed to suspend user.';
        this.actionLoading = null;
      }
    });
  }

  unsuspend(user: AdminUser): void {
    this.actionLoading = user.userId;
    this.clearMessages();
    this.adminSvc.unsuspendUser(user.userId).subscribe({
      next: () => {
        user.suspended = false;
        this.applyFilters();
        this.successMsg = `${user.email} has been reactivated.`;
        this.actionLoading = null;
      },
      error: (err: { error?: { message?: string } }) => {
        this.error = err.error?.message || 'Failed to unsuspend user.';
        this.actionLoading = null;
      }
    });
  }

  confirmDelete(userId: number): void { this.deleteTargetId = userId; }
  cancelDelete(): void { this.deleteTargetId = null; }

  deleteUser(): void {
    if (!this.deleteTargetId) return;
    const id = this.deleteTargetId;
    this.actionLoading = id;
    this.clearMessages();
    this.adminSvc.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.userId !== id);
        this.applyFilters();
        this.successMsg = 'User deleted successfully.';
        this.deleteTargetId = null;
        this.actionLoading = null;
      },
      error: (err: { error?: { message?: string } }) => {
        this.error = err.error?.message || 'Failed to delete user.';
        this.deleteTargetId = null;
        this.actionLoading = null;
      }
    });
  }

  clearMessages(): void { this.error = ''; this.successMsg = ''; }

  roleBadge(role: string): string {
    return role === 'RECRUITER' ? 'badge-amber' : role === 'ADMIN' ? 'badge-navy' : 'badge-teal';
  }
}
