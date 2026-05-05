import { Component, OnInit } from '@angular/core';
import { AdminService, AdminUser } from '../../../core/services/admin.service';

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  users: AdminUser[] = [];
  loading = true;
  error = '';

  get totalUsers()     { return this.users.length; }
  get candidates()     { return this.users.filter(u => u.role === 'CANDIDATE').length; }
  get recruiters()     { return this.users.filter(u => u.role === 'RECRUITER').length; }
  get suspendedCount() { return this.users.filter(u => u.suspended).length; }
  get recentUsers()    { return [...this.users].sort((a, b) => b.userId - a.userId).slice(0, 5); }

  constructor(private adminSvc: AdminService) {}

  ngOnInit(): void {
    this.adminSvc.getAllUsers().subscribe({
      next: (users: AdminUser[]) => { this.users = users; this.loading = false; },
      error: ()                   => { this.error = 'Failed to load users.'; this.loading = false; }
    });
  }
}
