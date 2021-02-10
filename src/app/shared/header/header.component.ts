import { Router } from '@angular/router';
import { AuthService } from './../../auth/services/auth.service';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public isMenuCollapsed = true;
  public user$: Observable<any> = this.authSvc.afAuth.user ;

  constructor(private authSvc: AuthService, private router:Router) { }


  async onLogout(){
    try {
      await this.authSvc.logout();
      this.router.navigate(['/login'])
    } catch (error) {
      console.log(error);
    }
  }


}
