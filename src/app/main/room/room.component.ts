import { Car } from './../../shared/model/car.interface';
import { User } from './../../shared/model/user.interface';
import { Observable } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';
import { MainService } from './../main.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './../../auth/services/auth.service';
import { Room } from './../../shared/model/room.interface';
import { Component, OnInit } from '@angular/core';
import { GoogleMapsAPIService } from 'src/app/shared/googlemaps/google-maps-API.service';
import { CarService } from '../car/car.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit {



  //MAPA
  origin;
  destination;
  waypoints;
  lat;
  lng;
  iconMarkerURL;







  roomObservable: Observable<Room>;
  uidUserCreatorRoom;

  room: Room = {};
  roomComplete: Room;
  public user$: Observable<User> = this.authSvc.afAuth.user;
  members: Observable<User[]>;
  driver;

  uidUserRef;
  roomUser;
  member;
  admUserRoom = false;
  uidUserRoomRef;

  navigationExtras: NavigationExtras = {
    state: {
      value: null,
    },
  };
  navigationExtrasCar: NavigationExtras = {
    state: {
      value: null,
    },
  };

  constructor(
    private authSvc: AuthService,
    private modalService: NgbModal,
    private mainSvc: MainService,
    private router: Router,
    private apigoogle: GoogleMapsAPIService,
    private carSvc: CarService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.room.uidRoom = navigation?.extras?.state?.value;
  }

  ngOnInit(): void {
    this.roomObservable = this.onGetOneRoom(this.room.uidRoom);
    this.roomObservable.subscribe((resp) => {
      this.uidUserCreatorRoom = resp.uidUser;
      this.roomComplete = resp;
      this.lat = this.roomComplete.roomAdress.latitude;
      this.lng = this.roomComplete.roomAdress.longitude;

      this.user$.subscribe((resp) => {
        this.uidUserRef = resp.uid;

        if (this.uidUserRef == this.uidUserCreatorRoom) {
          this.admUserRoom = true;
        }
      });
    });

    this.getMembersOfRoom(this.room.uidRoom);
    if (this.room.uidRoom == null) {
      this.router.navigate(['dashboard']);
    }

  }

  getMembersOfRoom(uidRoom: string) {
    this.members = this.mainSvc.membersOfRoom(uidRoom);
  }

  onUsers(uidUserMember: string) {
    this.member = this.mainSvc.getUsers(uidUserMember);
    return this.member;
  }

  onGetOneRoom(uidRoom: string) {
    return this.mainSvc.getOneRoom(uidRoom);
  }

  latelong(item: User) {
    return item.homeAdress.address;
  }

  onDriveOrRide(item: User, numberOfRides) {
    if (numberOfRides == 0) {
      item.ride = numberOfRides;
      item.driver = false;
      item.iconMap = 'https://marketingspot.com.br/cimages/Logo02.png';
    } else {
      item.ride = numberOfRides;
      item.driver = true;
      item.iconMap = 'https://marketingspot.com.br/cimages/Logo04.png';
    }
    this.mainSvc.updateRoom(item, this.room.uidRoom);
  }



  async onMatchCar(){

    let uidMemberSaveZEROOOO: User[] = [];

    await new Promise((resolve) => {
      this.members.subscribe((resp)=>{
        uidMemberSaveZEROOOO = resp;
        resolve(uidMemberSaveZEROOOO);
       });
    });


    for (let index = 0; index < uidMemberSaveZEROOOO.length; index++) {
      await this.carSvc.saveIfMemberHasRideZEROOO(this.roomComplete.uidRoom , uidMemberSaveZEROOOO[index].uid);
    }
    await this.carSvc.matchNow(this.roomComplete);

  }

}

