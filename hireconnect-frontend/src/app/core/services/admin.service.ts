import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models';

export interface AdminUser {
  userId: number;
  email: string;
  role: string;
  suspended: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = '/admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<ApiResponse<AdminUser[]>>(`${this.base}/users`)
      .pipe(map(r => r.data || []));
  }

  getUserById(id: number): Observable<AdminUser> {
    return this.http.get<ApiResponse<AdminUser>>(`${this.base}/users/${id}`)
      .pipe(map(r => r.data));
  }

  suspendUser(id: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/users/${id}/suspend`, {});
  }

  unsuspendUser(id: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/users/${id}/unsuspend`, {});
  }

  deleteUser(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.base}/users/${id}`);
  }
}
