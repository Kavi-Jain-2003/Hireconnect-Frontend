import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/interview-notification.service';
import { Notification } from '../../../core/models';

@Component({
  standalone: false,
  selector: 'app-recruiter-notifications',
  templateUrl: './recruiter-notifications.component.html',
  styleUrls: ['./recruiter-notifications.component.scss']
})
export class RecruiterNotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  markingAll = false;

  constructor(private notifSvc: NotificationService) {}

  private isRead(item: Notification): boolean {
    return Boolean((item as any).isRead ?? (item as any).read);
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.notifSvc.getMyNotifications().subscribe({
      next: n => {
        const unique = new Map<string, Notification>();
        n.forEach(item => {
          const normalized = { ...item, isRead: this.isRead(item) } as Notification;
          const key = `${normalized.type}|${normalized.message}`;
          const current = unique.get(key);
          if (!current || new Date(normalized.createdAt).getTime() > new Date(current.createdAt).getTime()) {
            unique.set(key, normalized);
          }
        });
        this.notifications = Array.from(unique.values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  markRead(id: number) {
    this.notifSvc.markRead(id).subscribe({
      next: () => { this.notifications = this.notifications.map(n => n.notificationId === id ? { ...n, isRead: true } : n); },
      error: () => {}
    });
  }

  markAllRead() {
    this.markingAll = true;
    this.notifSvc.markAllRead().subscribe({
      next: () => { this.notifications = this.notifications.map(n => ({ ...n, isRead: true })); this.markingAll = false; },
      error: () => { this.markingAll = false; }
    });
  }

  delete(id: number) {
    this.notifSvc.delete(id).subscribe({
      next: () => { this.notifications = this.notifications.filter(n => n.notificationId !== id); },
      error: () => {}
    });
  }

  get unreadCount() { return this.notifications.filter(n => !n.isRead).length; }

  typeIcon(type: string) {
    const icons: Record<string, string> = {
      APPLICATION_STATUS: '📋', INTERVIEW: '📅', JOB_ALERT: '💼',
      INTERVIEW_SCHEDULED: '📅', OFFER: '🎉', NEW_APPLICATION: '📩'
    };
    return icons[type] || '🔔';
  }
}
