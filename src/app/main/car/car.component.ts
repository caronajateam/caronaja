import { Observable } from 'rxjs';
import { Car } from './../../shared/model/car.interface';
import { MainService } from './../main.service';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/model/user.interface';
import { Router } from '@angular/router';
import { Room } from 'src/app/shared/model/room.interface';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.scss']
})
export class CarComponent implements OnInit {

  public user$: Observable<User> = this.authSvc.afAuth.user;

  car: Car;
  membersOfCar:Observable<User[]>;
  membersOfCarUser: User[];
  userObservable: Observable<User>;
  user: User;
  userPassengerList: User[];
  uidUserRef: string;
  uidRoom;
  userTest;
  origin;
  destination;
  waypoints;
  lat;
  lng;



  constructor(private router: Router, private mainSvc: MainService, private authSvc: AuthService) {
    const navigation = this.router.getCurrentNavigation();
    this.uidRoom = navigation?.extras?.state?.value;
   }

    async ngOnInit() {

      await this.getUidUserRefFromUser$();
      await this.getOneUserRoom(this.uidUserRef, this.uidRoom);
      await this.getCar(this.uidUserRef, this.uidRoom);
      await this.getMembersOfCar(this.uidRoom,this.uidUserRef);
      this.points();
      // if(this.user.driver){
      //   this.sendWhatsapp();
      // }


  }





  getUidUserRefFromUser$(){
    return new Promise((resolve)=>{
      this.user$.subscribe((resp)=> {
        this.uidUserRef = resp.uid;
        console.log(this.uidUserRef);
        console.log(this.uidRoom);
        return resolve(this.uidUserRef);
      })
    })
  }

  getOneUserRoom(uidUserRef, uidRoom){
    return new Promise((resolve)=>{
      this.userObservable = this.mainSvc.getOneUserFromRoom(uidUserRef , uidRoom);
      this.userObservable.subscribe((resp)=>{
        this.user = resp;
        return resolve(this.user);
      })
    })
  }

  getCar(uidUserRef, uidRoom){
      return new Promise((resolve)=>{
        this.mainSvc.getCar(uidUserRef, uidRoom).subscribe((resp)=>{
          this.car = resp;
          return resolve(this.car);
        });
      })
    }


  getMembersOfCar(uidRoom: string, uidUserRef) {
    return new Promise((resolve)=>{
      this.membersOfCar = this.mainSvc.getMembersOfCar(uidRoom, uidUserRef);
      this.membersOfCar.subscribe((resp)=>{
      this.membersOfCarUser = resp;
        return resolve(this.membersOfCarUser);
      })
    })
  }

 points(){

  console.log('aqui esta printando');

        let arrayWayPoints: Array<{location?: {lat, lng}}> = [];

        for (let index = 0; index < this.membersOfCarUser.length; index++) {
          arrayWayPoints.push({
            location:{
              lat: this.membersOfCarUser[index].homeAdress.latitude ,
              lng: this.membersOfCarUser[index].homeAdress.longitude
            }
          })
        }
        console.log(arrayWayPoints)

        this.lat =  this.car.origin.latitude;
        this.lng =  this.car.origin.longitude;

        this.origin = {
          lat:  this.car.origin.latitude,
          lng: this.car.origin.longitude
        }

        this.destination = {
          lat:  this.car.destination.latitude,
          lng: this.car.destination.longitude
        }
        this.waypoints = arrayWayPoints;

  }

  sendWhatsapp(){
    "https://api.whatsapp.com/send?phone={{item.number}}&text=Oi%20serei%20seu%20motorista!!%20Prazer%20sou%20{{car.displayNameDriver}}"
  }

}
