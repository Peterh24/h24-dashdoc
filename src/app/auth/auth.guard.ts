import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
//import { AuthService } from '../services/auth.service';


export const authGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  //const auth = inject(AuthService);
  const router = inject(Router);
  // if(!auth.userIsAuthenticated) {
  //   router.navigateByUrl('/auth')
  // }
  // return auth.userIsAuthenticated;
};
