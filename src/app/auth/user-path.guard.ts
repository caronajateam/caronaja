import { AuthService } from './services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserPathGuard implements CanActivate {
  constructor(private authSvc: AuthService){}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.authSvc.user$.pipe(
      take(1),
      map((user)=> user && this.authSvc.isAdmin(user)),
      tap(userPathGuard =>{
        if (!userPathGuard){
          window.alert('Access denied.');
        }
      })
    );
  }

}
