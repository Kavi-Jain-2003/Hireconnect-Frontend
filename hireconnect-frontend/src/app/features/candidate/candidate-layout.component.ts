import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/interview-notification.service';

@Component({
  standalone: false,
  selector: 'app-candidate-layout',
  template: `
<div class="page-wrapper">
  <nav class="navbar">
    <a class="navbar-brand" routerLink="/">Hire<span style="color:var(--teal)">Connect</span></a>
    <div class="navbar-spacer"></div>
    <div class="navbar-actions">
      <span style="font-size:14px;color:var(--text-muted)">{{auth.getEmail()}}</span>
      <span class="badge badge-teal">Candidate</span>
      <a class="notif-bell" routerLink="/candidate/notifications">
        🔔 <span class="notif-count" *ngIf="unreadCount > 0">{{unreadCount}}</span>
      </a>
      <button class="btn btn-ghost btn-sm" (click)="logout()">Sign Out</button>
    </div>
  </nav>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="nav-section">
        <span class="nav-label">Main</span>
        <a class="nav-item" routerLink="/candidate/dashboard" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          Dashboard
        </a>
        <a class="nav-item" routerLink="/jobs" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
          Browse Jobs
        </a>
        <a class="nav-item" routerLink="/candidate/applications" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></span>
          My Applications
        </a>
        <a class="nav-item" routerLink="/candidate/interviews" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          Interviews
        </a>
        <a class="nav-item" routerLink="/candidate/notifications" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg></span>
          Notifications
          <span style="background:var(--rose);color:white;font-size:11px;padding:1px 7px;border-radius:999px;margin-left:auto" *ngIf="unreadCount > 0">{{unreadCount}}</span>
        </a>
      </div>
      <div class="nav-section">
        <span class="nav-label">Account</span>
        <a class="nav-item" routerLink="/candidate/profile" routerLinkActive="active">
          <span class="nav-icon"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
          My Profile
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
export class CandidateLayoutComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  private timer: any;

  constructor(public auth: AuthService, private router: Router, private notifSvc: NotificationService) {}

  ngOnInit() {
    this.loadUnread();
    this.timer = setInterval(() => this.loadUnread(), 30000); // poll every 30s
  }

  ngOnDestroy() { clearInterval(this.timer); }

  loadUnread() {
    this.notifSvc.getUnreadCount().subscribe({ next: c => { this.unreadCount = c; }, error: () => {} });
  }

  logout() { this.auth.logout(); this.router.navigate(['/']); }
}
