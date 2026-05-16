import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/interview-notification.service';

@Component({
  standalone: false,
  selector: 'app-recruiter-layout',
  template: `
<div class="page-wrapper">
  <nav class="navbar">
    <a class="navbar-brand" routerLink="/">Hire<span style="color:var(--teal)">Connect</span></a>
    <div class="navbar-spacer"></div>
    <div class="navbar-actions">
      <span style="font-size:14px;color:var(--text-muted)">{{auth.getEmail()}}</span>
      <span class="badge badge-amber">Recruiter</span>
      <a class="notif-bell" routerLink="/recruiter/notifications">
        🔔 <span class="notif-count" *ngIf="unreadCount > 0">{{unreadCount}}</span>
      </a>
      <button class="btn btn-ghost btn-sm" (click)="logout()">Sign Out</button>
    </div>
  </nav>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="nav-section">
        <span class="nav-label">Main</span>
        <a class="nav-item" routerLink="/recruiter/dashboard" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          Dashboard
        </a>
        <a class="nav-item" routerLink="/recruiter/jobs" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg></span>
          My Job Posts
        </a>
        <a class="nav-item" routerLink="/recruiter/applications" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></span>
          Applications
        </a>
        <a class="nav-item" routerLink="/recruiter/analytics" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></span>
          Analytics
        </a>
        <a class="nav-item" routerLink="/recruiter/notifications" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg></span>
          Notifications
          <span style="background:var(--rose);color:white;font-size:11px;padding:1px 7px;border-radius:999px;margin-left:auto" *ngIf="unreadCount > 0">{{unreadCount}}</span>
        </a>
      </div>
      <div class="nav-section">
        <span class="nav-label">Account</span>
        <a class="nav-item" routerLink="/recruiter/profile" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
          Company Profile
        </a>
        <a class="nav-item" routerLink="/recruiter/subscription" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span>
          Subscription
        </a>
      </div>
    </aside>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>`,
  styles: [`
    .notif-bell { position:relative; font-size:20px; cursor:pointer; text-decoration:none; }
    .notif-count { position:absolute; top:-6px; right:-8px; background:var(--rose); color:white; font-size:10px; font-weight:700; padding:1px 5px; border-radius:999px; font-family:'DM Sans',sans-serif; }
  `]
})
export class RecruiterLayoutComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  private timer: any;

  constructor(public auth: AuthService, private router: Router, private notifSvc: NotificationService) {}

  ngOnInit() {
    this.loadUnread();
    // Poll every 20 s to reflect RabbitMQ-driven notifications promptly
    this.timer = setInterval(() => this.loadUnread(), 20000);
  }

  ngOnDestroy() { clearInterval(this.timer); }

  loadUnread() {
    this.notifSvc.getUnreadCount().subscribe({ next: c => { this.unreadCount = c; }, error: () => {} });
  }

  // auth.logout() calls POST /auth/logout (Redis blacklist) then navigates to /
  logout() { this.auth.logout(); }
}
