import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'Something went wrong. Please try again.';

        if (error.error) {
          // Try to extract message from different response shapes
          if (typeof error.error === 'string') {
            // Raw string body
            message = error.error;
          } else if (error.error.message) {
            message = error.error.message;
          } else if (error.error.error) {
            message = error.error.error;
          }
        }

        // Rethrow with normalized error shape
        return throwError(() => ({
          error: { message },
          status: error.status
        }));
      })
    );
  }
}
