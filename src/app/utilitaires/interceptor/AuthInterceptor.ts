import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable()

export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.endsWith('/api/auth/user/me/')) {
          this.router.navigate(['/'], {
            queryParams: {
              message: 'Votre session a expiré. Veuillez vous reconnecter.',
            },
          });
          // Le throwError est compatible avec Observable<HttpEvent<any>>
          return throwError(() => new Error('Unauthorized'));
        } else if (error.status === 401) {
          console.error('Session peut-être expirée ou utilisateur non connecté.');
          // Pour les erreurs que vous souhaitez "ignorer", vous pouvez retourner un HttpResponse vide
          // Cela signifie que vous traitez l'erreur mais ne bloquez pas le flux d'exécution
          return of(new HttpResponse({ status: 401, body: null }));
        }
        // Pour toutes les autres erreurs, renvoyez-les comme des erreurs observables
        return throwError(() => error);
      })
    );
  }
}
