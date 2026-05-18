import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Job, JobRequest, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class JobService {
  private base = '/api/jobs';
  constructor(private http: HttpClient) {}

  // Public endpoints (no auth needed)
  getAllJobs(): Observable<Job[]> {
    return this.http.get<ApiResponse<Job[]>>(`${this.base}/public`).pipe(
      map(r => (r.data || []).map(j => ({ ...j, skills: j.skills || [] })))
    );
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<ApiResponse<Job>>(`${this.base}/public/${id}`).pipe(
      map(r => ({ ...(r.data as Job), skills: r.data?.skills || [] }))
    );
  }

  searchJobs(title?: string, location?: string, category?: string,
             minSalary?: number, maxSalary?: number, experience?: number): Observable<Job[]> {
    let params = new HttpParams();
    if (title)      params = params.set('title', title);
    if (location)   params = params.set('location', location);
    if (category)   params = params.set('category', category);
    if (minSalary != null) params = params.set('minSalary', String(minSalary));
    if (maxSalary != null) params = params.set('maxSalary', String(maxSalary));
    if (experience != null) params = params.set('experience', String(experience));
    return this.http.get<ApiResponse<Job[]>>(`${this.base}/public/search`, { params }).pipe(map(r => r.data || []));
  }

  // Auth-required endpoints
  postJob(req: JobRequest): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.base}`, req).pipe(map(r => r.message));
  }

  updateJob(id: number, req: JobRequest): Observable<string> {
    return this.http.put<ApiResponse<string>>(`${this.base}/${id}`, req).pipe(map(r => r.message));
  }

  deleteJob(id: number): Observable<string> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/${id}`).pipe(map(r => r.message));
  }

  pauseJob(id: number): Observable<string> {
    return this.http.put<ApiResponse<string>>(`${this.base}/${id}/pause`, {}).pipe(map(r => r.message));
  }

  closeJob(id: number): Observable<string> {
    return this.http.put<ApiResponse<string>>(`${this.base}/${id}/close`, {}).pipe(map(r => r.message));
  }
}
