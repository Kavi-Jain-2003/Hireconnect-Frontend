import { Component, OnInit, signal, computed } from '@angular/core';
import { NotificationService } from '../../../core/services/interview-notification.service';
import { Notification } from '../../../core/models';

@Component({
  standalone: false,
  selector: 'app-candidate-notifications',
  templateUrl: './candidate-notifications.component.html',
  styleUrls: ['./candidate-notifications.component.scss']
})
export class CandidateNotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  loading = signal(true);
  markingAll = signal(false);

  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  constructor(private notifSvc: NotificationService) {}

  private isRead(item: Notification): boolean {
    return Boolean((item as unknown as { isRead?: boolean; read?: boolean }).isRead ??
      (item as unknown as { isRead?: boolean; read?: boolean }).read);
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
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
        this.notifications.set(
          Array.from(unique.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  markRead(id: number) {
    this.notifSvc.markRead(id).subscribe({
      next: () => { this.notifications.update(ns => ns.map(n => n.notificationId === id ? { ...n, isRead: true } : n)); },
      error: () => {}
    });
  }

  markAllRead() {
    this.markingAll.set(true);
    this.notifSvc.markAllRead().subscribe({
      next: () => { this.notifications.update(ns => ns.map(n => ({ ...n, isRead: true }))); this.markingAll.set(false); },
      error: () => { this.markingAll.set(false); }
    });
  }

  delete(id: number) {
    this.notifSvc.delete(id).subscribe({
      next: () => { this.notifications.update(ns => ns.filter(n => n.notificationId !== id)); },
      error: () => {}
    });
  }

  typeIcon(type: string) {
    const icons: Record<string, string> = {
      APPLICATION_STATUS: '📋', INTERVIEW: '📅', JOB_ALERT: '💼',
      INTERVIEW_SCHEDULED: '📅', OFFER: '🎉'
    };
    return icons[type] || '🔔';
  }
}
