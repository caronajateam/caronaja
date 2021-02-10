import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  userEmail = new FormControl('');

  constructor(private authSvc: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  async onReset(){
    try {
      const email = this.userEmail.value;
      await this.authSvc.resetPassword(email);
      window.alert('Email sent, check your inbox!');
      this.router.navigate(['/login']);
    } catch (error) {
      console.log(error);
    }

  }

}
