import { Observable } from 'rxjs';
import { AuthService } from './../auth/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public user$: Observable<any> = this.authSvc.afAuth.user ;

  constructor(private authSvc: AuthService) { }

  ngOnInit(): void {
  }

}
