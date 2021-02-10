import { GoogleGetaddressService } from './../../shared/googlemaps/google-places/google-getaddress.service';
import { Router } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { User } from 'src/app/shared/model/user.interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    displayName: new FormControl(''),
    number: new FormControl(''),
    homeAdress: new FormControl(''),
    workAdress: new FormControl(''),
  });

  homeAdressLatLng: {address, latitude, longitude };
  workAdressLatLng: {address, latitude, longitude};


  constructor(private authSvc: AuthService, private router: Router, private getaddr: GoogleGetaddressService) {}

  ngOnInit(): void {}

  onGetAddressHome(place: object | any){
   this.getaddr.getAddress(place).then(
     (coords) => {
      this.homeAdressLatLng = coords;
       console.log(this.homeAdressLatLng);
     }
   )

  }

  onGetAddressWork(place: object | any){
    this.getaddr.getAddress(place).then(
      (coords) => {
       this.workAdressLatLng = coords;
        console.log(this.workAdressLatLng);
      }
    )

   }



  async onRegister() {
    try {
      const {
        email,
        password,
        displayName,
        number
      } = this.registerForm.value;
      const user = await this.authSvc.register(
        email,
        password,
        displayName,
        number,
        this.homeAdressLatLng,
        this.workAdressLatLng
      );
      if (user) {
        this.router.navigate(['/verification-email']);
      }
    } catch (error) {
      console.log(error);
    }
  }



}
