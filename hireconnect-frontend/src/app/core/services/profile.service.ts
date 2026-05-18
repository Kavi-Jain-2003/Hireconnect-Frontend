import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CandidateProfile, RecruiterProfile, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private base = '/profiles';
  constructor(private http: HttpClient) {}

  // ── Candidate ──────────────────────────────────────
  // POST /profiles/candidate  — email injected by backend from JWT
  createCandidateProfile(p: Partial<CandidateProfile>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.base}/candidate`, p);
  }

  // PUT /profiles/candidate/{id}
  updateCandidateProfile(id: number, p: Partial<CandidateProfile>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/candidate/${id}`, p);
  }

  // GET /profiles/public/candidate/email/{email}
  getCandidateByEmail(email: string): Observable<CandidateProfile> {
    return this.http.get<ApiResponse<CandidateProfile>>(
      `${this.base}/public/candidate/email?email=${encodeURIComponent(email)}`
    ).pipe(map(r => r.data));
  }

  // GET /profiles/public/candidate/id/{id}
  getCandidateById(id: number): Observable<CandidateProfile> {
    return this.http.get<ApiResponse<CandidateProfile>>(
      `${this.base}/public/candidate/id/${id}`
    ).pipe(map(r => r.data));
  }

  // ── Recruiter ──────────────────────────────────────
  // POST /profiles/recruiter
  createRecruiterProfile(p: Partial<RecruiterProfile>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.base}/recruiter`, p);
  }

  // PUT /profiles/recruiter/{id}
  updateRecruiterProfile(id: number, p: Partial<RecruiterProfile>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/recruiter/${id}`, p);
  }

  // GET /profiles/public/recruiter/email/{email}
  getRecruiterByEmail(email: string): Observable<RecruiterProfile> {
    return this.http.get<ApiResponse<RecruiterProfile>>(
      `${this.base}/public/recruiter/email?email=${encodeURIComponent(email)}`
    ).pipe(map(r => r.data));
  }

  // GET /profiles/public/recruiter/id/{id}
  getRecruiterById(id: number): Observable<RecruiterProfile> {
    return this.http.get<ApiResponse<RecruiterProfile>>(
      `${this.base}/public/recruiter/id/${id}`
    ).pipe(map(r => r.data));
  }
}
