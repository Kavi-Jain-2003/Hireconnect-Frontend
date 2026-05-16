import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // 401 means the JWT is expired or was blacklisted in Redis after logout.
        // Clear the local session so the user is redirected to login on next navigation.
        if (error.status === 401 && !req.url.includes('/auth/logout') && !req.url.includes('/admin')) {
          this.auth.clearSession();
        }

        let message = 'Something went wrong. Please try again.';

        if (error.error) {
          if (typeof error.error === 'string') {
            message = error.error;
          } else if (error.error.message) {
            message = error.error.message;
          } else if (error.error.error) {
            message = error.error.error;
          }
        }

        return throwError(() => ({
          error: { message },
          status: error.status
        }));
      })
    );
  }
}
