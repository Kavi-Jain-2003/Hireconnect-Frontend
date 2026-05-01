import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Application, ApplicationRequest, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private base = '/applications';
  constructor(private http: HttpClient) {}

  // POST /applications  — body: { jobId, coverLetter, resumeUrl }
  // candidateId injected from JWT by backend
  apply(req: ApplicationRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.base, req);
  }

  // GET /applications/candidate/{id}
  getByCandidate(candidateId: number): Observable<Application[]> {
    return this.http.get<ApiResponse<Application[]>>(
      `${this.base}/candidate/${candidateId}`
    ).pipe(map(r => r.data || []));
  }

  // GET /applications/job/{id}
  getByJob(jobId: number): Observable<Application[]> {
    return this.http.get<ApiResponse<Application[]>>(
      `${this.base}/job/${jobId}`
    ).pipe(map(r => r.data || []));
  }

  // GET /applications/public/{id}
  getById(id: number): Observable<Application> {
    return this.http.get<ApiResponse<Application>>(
      `${this.base}/public/${id}`
    ).pipe(map(r => r.data));
  }

  // PUT /applications/{id}/status  — body: { status: ApplicationStatus }
  updateStatus(id: number, status: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/${id}/status`, { status });
  }

  // DELETE /applications/{id}
  withdraw(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.base}/${id}`);
  }

  // GET /applications/job/{id}/count
  countByJob(jobId: number): Observable<number> {
    return this.http.get<ApiResponse<number>>(
      `${this.base}/job/${jobId}/count`
    ).pipe(map(r => r.data || 0));
  }
}
