import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Interview, Notification, ApiResponse } from '../models';

// ── Interview Service ──────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class InterviewService {
  private base = '/interviews';
  constructor(private http: HttpClient) {}

  private normalizeDateTime(value: string): string {
    if (!value) return value;
    return value.length === 16 ? `${value}:00` : value;
  }

  // POST /interviews
  schedule(iv: Partial<Interview>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.base, {
      ...iv,
      scheduledAt: iv.scheduledAt ? this.normalizeDateTime(iv.scheduledAt) : iv.scheduledAt
    });
  }

  // PUT /interviews/{id}/confirm
  confirm(id: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/${id}/confirm`, {});
  }

  // PUT /interviews/{id}/reschedule  — body: { scheduledAt }
  reschedule(id: number, scheduledAt: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/${id}/reschedule`, {
      scheduledAt: this.normalizeDateTime(scheduledAt)
    });
  }

  // PUT /interviews/{id}/cancel
  cancel(id: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/${id}/cancel`, {});
  }

  // GET /interviews/application/{appId}
  getByApplication(appId: number): Observable<Interview[]> {
    return this.http.get<ApiResponse<Interview[]>>(
      `${this.base}/application/${appId}`
    ).pipe(map(r => r.data || []));
  }

  // GET /interviews/status/{status}
  getByStatus(status: string): Observable<Interview[]> {
    return this.http.get<ApiResponse<Interview[]>>(
      `${this.base}/status/${status}`
    ).pipe(map(r => r.data || []));
  }
}

// ── Notification Service ───────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = '/notifications';
  constructor(private http: HttpClient) {}

  // GET /notifications/my
  getMyNotifications(): Observable<Notification[]> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.base}/my`).pipe(map(r => r.data || []));
  }

  // PUT /notifications/read/{id}
  markRead(id: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/read/${id}`, {});
  }

  // PUT /notifications/read-all
  markAllRead(): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/read-all`, {});
  }

  // DELETE /notifications/{id}
  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.base}/${id}`);
  }

  // GET /notifications/unread-count
  getUnreadCount(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.base}/unread-count`).pipe(map(r => r.data || 0));
  }
}
