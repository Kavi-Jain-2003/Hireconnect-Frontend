import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsSummary } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private base = '/analytics';
  constructor(private http: HttpClient) {}

  // GET /analytics/recruiter/{id}
  getRecruiterStats(recruiterId: number): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.base}/recruiter/${recruiterId}`);
  }

  // GET /analytics/admin
  getAdminStats(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.base}/admin`);
  }
}
