import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UtcDateInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map(event => {
        if (event instanceof HttpResponse && event.body) {
          const modifiedBody = this.transformDatesToUtcFormat(event.body);
          return event.clone({ body: modifiedBody });
        }
        return event;
      })
    );
  }

  private transformDatesToUtcFormat(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.transformDatesToUtcFormat(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj = { ...obj };
      Object.keys(newObj).forEach(key => {
        newObj[key] = this.transformDatesToUtcFormat(newObj[key]);
      });
      return newObj;
    } else if (typeof obj === 'string' && this.isIso8601Date(obj)) {
      // Conversion de la chaîne ISO 8601 en UTC+0
      const date = new Date(obj);
      const utcString = date.toISOString(); // toISOString retourne une date en UTC
      return utcString;
    }
    return obj;
  }

  private isIso8601Date(str: string): boolean {
    // Vérifie si la chaîne correspond à un format de date ISO 8601
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(str);
  }
}
