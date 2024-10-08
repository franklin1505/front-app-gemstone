import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404 && !req.url.includes('/error')) {
          // Redirect to the error page if a 404 error occurs
          this.router.navigate(['/error'], { queryParams: { type: '404' } });
        } else if (error.status === 0 && !req.url.includes('/error')) {
          // Redirect to the error page if an unknown error occurs
          this.router.navigate(['/error'], { queryParams: { type: 'unknown' } });
        }
        
        return throwError(error);
      })
    );
  }
}
