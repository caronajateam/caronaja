import { GoogleGetaddressService } from './../../shared/googlemaps/google-places/google-getaddress.service';
import { Router } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
  liberarBotao:boolean = true;
  contadorMetodos:number = 0;
  homeAdressLatLng: {address, latitude, longitude };
  workAdressLatLng: {address, latitude, longitude};
  errorRegisterMessage:string;
  verificaErrorForm:string;


  constructor(private authSvc: AuthService, private router: Router, private getaddr: GoogleGetaddressService) {}

  ngOnInit(): void {}

  onGetAddressHome(place: object | any){
   this.contadorMetodos++;
   this.liberarBotao = this.verificaQuantMetodos();
   this.getaddr.getAddress(place).then(
     (coords) => {
      this.homeAdressLatLng = coords;
       console.log(this.homeAdressLatLng);
     }
   )

  }

  onGetAddressWork(place: object | any){
    this.contadorMetodos++;
    this.liberarBotao = this.verificaQuantMetodos();
    this.getaddr.getAddress(place).then(
      (coords) => {
       this.workAdressLatLng = coords;
        console.log(this.workAdressLatLng);
      }
    )

   }

   verificaQuantMetodos(){
    if(this.contadorMetodos != 1 && this.contadorMetodos !=0){
     return false;
    }
      return true;
  }

  async onRegister() {
    let name = (<HTMLInputElement>document.getElementById('name')).value;
    let telefone = (<HTMLInputElement>document.getElementById('telefone')).value;
    console.log(name)
    if(name==''){
      this.verificaErrorForm = 'nome';
      this.errorRegisterMessage = 'Verifique o campo digitado'
    }else if(telefone==''){
      this.verificaErrorForm = 'telefone';
      this.errorRegisterMessage = 'Verifique o campo digitado'
    }
    else {
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
      if (user && user.code == null) {
        this.router.navigate(['/verification-email']);
      }else {
        if(user == "auth/invalid-email"){
          this.verificaErrorForm = 'email';
          this.errorRegisterMessage = 'Email inválido';
        }else if (user == "auth/email-already-in-use") {
          this.verificaErrorForm = 'email';
          this.errorRegisterMessage = 'Email em uso';
        }
        else {
          this.verificaErrorForm = 'senha';
          this.errorRegisterMessage = 'Senha fraca'
        }
      }
    } catch (error) {
    }
  }
}

}
