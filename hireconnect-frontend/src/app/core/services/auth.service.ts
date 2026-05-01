import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoginRequest, RegisterRequest, LoginResponse, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = '/auth';
  constructor(private http: HttpClient) {}

  private normalizeRole(role: string | null | undefined): string {
    if (!role) return '';
    return role.replace(/^ROLE_/, '').trim().toUpperCase();
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  register(req: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.base}/register`, {
      email: req.email,
      password: req.password,
      role: req.role   // CANDIDATE or RECRUITER — enum string, Jackson deserializes it fine
    }).pipe(
      catchError(err => {
        // Backend throws RuntimeException → Spring returns 500 with message in body
        const msg = err.error?.message || err.error?.error || err.message || 'Registration failed';
        return throwError(() => ({ error: { message: msg } }));
      })
    );
  }

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.base}/login`, {
      email: req.email,
      password: req.password
    }).pipe(
      tap(res => {
        if (res?.data) {
          localStorage.setItem('hc_token', res.data.token);
          localStorage.setItem('hc_email', res.data.email);
          localStorage.setItem('hc_role', this.normalizeRole(res.data.role));
        }
      }),
      map(res => res.data),
      catchError(err => {
        const msg = err.error?.message || err.error?.error || 'Invalid credentials';
        return throwError(() => ({ error: { message: msg } }));
      })
    );
  }

  // Called after GitHub OAuth redirects back with token in URL
  loginWithToken(token: string, email: string, role: string): void {
    localStorage.setItem('hc_token', token);
    const payload = this.decodeJwtPayload(token);
    const resolvedEmail = email || (payload?.['sub'] as string | undefined) || '';
    const resolvedRole = role || (payload?.['role'] as string | undefined) || 'CANDIDATE';
    localStorage.setItem('hc_email', resolvedEmail);
    localStorage.setItem('hc_role', this.normalizeRole(resolvedRole));
  }

  logout(): void {
    localStorage.removeItem('hc_token');
    localStorage.removeItem('hc_email');
    localStorage.removeItem('hc_role');
  }

  getToken(): string | null  { return localStorage.getItem('hc_token'); }
  getEmail(): string | null  {
    const email = localStorage.getItem('hc_email');
    if (email) return email;
    const token = this.getToken();
    if (!token) return null;
    return (this.decodeJwtPayload(token)?.['sub'] as string | undefined) || null;
  }
  getRole():  string | null  {
    const role = this.normalizeRole(localStorage.getItem('hc_role'));
    if (role) return role;
    const token = this.getToken();
    if (!token) return null;
    return this.normalizeRole(this.decodeJwtPayload(token)?.['role'] as string | undefined);
  }
  isLoggedIn(): boolean      { return !!this.getToken(); }
  isCandidate(): boolean     { return this.getRole() === 'CANDIDATE'; }
  isRecruiter(): boolean     { return this.getRole() === 'RECRUITER'; }
}
