import { Observable } from 'rxjs';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.scss']
})
export class SendEmailComponent implements OnInit {
  public user$: Observable<any> = this.authSvc.afAuth.user;
  constructor(private authSvc: AuthService) { }

  ngOnInit(): void {
  }

  onSendEmail():void{
    this.authSvc.sendVerificationEmail();

  }



}
