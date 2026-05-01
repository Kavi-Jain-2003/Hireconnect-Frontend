import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    const roles: string[] = route.data['roles'] || [];
    const role = this.auth.getRole();
    if (roles.length > 0 && (!role || !roles.includes(role))) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
