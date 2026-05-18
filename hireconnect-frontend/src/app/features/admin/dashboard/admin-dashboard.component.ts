import { Component, OnInit, signal, computed } from '@angular/core';
import { AdminService, AdminUser } from '../../../core/services/admin.service';

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  loading = signal(true);
  error = signal('');

  totalUsers     = computed(() => this.users().length);
  candidates     = computed(() => this.users().filter(u => u.role === 'CANDIDATE').length);
  recruiters     = computed(() => this.users().filter(u => u.role === 'RECRUITER').length);
  suspendedCount = computed(() => this.users().filter(u => u.suspended).length);
  recentUsers    = computed(() => [...this.users()].sort((a, b) => b.userId - a.userId).slice(0, 5));

  constructor(private adminSvc: AdminService) {}

  ngOnInit(): void {
    this.adminSvc.getAllUsers().subscribe({
      next: (users: AdminUser[]) => { this.users.set(users); this.loading.set(false); },
      error: ()                   => { this.error.set('Failed to load users.'); this.loading.set(false); }
    });
  }
}
