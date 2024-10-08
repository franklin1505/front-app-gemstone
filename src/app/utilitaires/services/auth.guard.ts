import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CrmService } from './crm.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private crmService: CrmService, private router: Router) {}

  canActivate(): boolean {
    if (this.crmService.isUserAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
