import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-admin-layout',
  template: `
<div class="page-wrapper">
  <nav class="navbar">
    <a class="navbar-brand" routerLink="/">Hire<span style="color:var(--teal)">Connect</span></a>
    <div class="navbar-spacer"></div>
    <div class="navbar-actions">
      <span style="font-size:14px;color:var(--text-muted)">{{auth.getEmail()}}</span>
      <span class="badge badge-navy">Admin</span>
      <button class="btn btn-ghost btn-sm" (click)="logout()">Sign Out</button>
    </div>
  </nav>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="nav-section">
        <span class="nav-label">Admin Panel</span>
        <a class="nav-item" routerLink="/admin/dashboard" routerLinkActive="active">
          <span class="nav-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </span>
          Dashboard
        </a>
        <a class="nav-item" routerLink="/admin/users" routerLinkActive="active">
          <span class="nav-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </span>
          Manage Users
        </a>
        <a class="nav-item" routerLink="/jobs" routerLinkActive="active">
          <span class="nav-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
          </span>
          Browse Jobs
        </a>
      </div>
    </aside>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>`,
  styles: []
})
export class AdminLayoutComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout(): void { this.auth.logout(); this.router.navigate(['/']); }
}
