import { GoogleGetaddressService } from './../../shared/googlemaps/google-places/google-getaddress.service';
import { User } from './../../shared/model/user.interface';
import { Observable } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';
import { MainService } from './../main.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './../../auth/services/auth.service';
import { Room } from './../../shared/model/room.interface';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit {
  roomObservable: Observable<Room>;
  uidUserCreatorRoom;

  room: Room = {};
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

  constructor(
    private authSvc: AuthService,
    private modalService: NgbModal,
    private mainSvc: MainService,
    private router: Router,
    private googleService:GoogleGetaddressService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.room.uidRoom = navigation?.extras?.state?.value;
  }

  getDistanceOfTheMembers(){
    // this.googleApiService.getDistance(this.origins,this.destinations).subscribe(
    //   (resp:any) =>{
    //     console.log(resp)
    //   }
    // )
    this.googleService.getDistance("RuaAntonioZendron,216",["RuaGetulioVargas90"]).subscribe(
        (resp:any) =>{
           console.log(resp)
         }
       )

  }

  ngOnInit(): void {
    this.roomObservable = this.onGetOneRoom(this.room.uidRoom);
    this.roomObservable.subscribe((resp) => {
      this.uidUserCreatorRoom = resp.uidUser;

      this.user$.subscribe((resp) => {
        this.uidUserRef = resp.uid;

        if (this.uidUserRef == this.uidUserCreatorRoom) {
          this.admUserRoom = true;
        }
      });
    });

    this.getMembersOfRoom(this.room.uidRoom);
    if(this.room.uidRoom == null ){
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
    if ((numberOfRides == 0)) {
      item.ride = numberOfRides;
      item.driver = false;
    } else {
      item.ride = numberOfRides;
      item.driver = true;
    }
    this.mainSvc.updateRoom(item, this.room.uidRoom);
  }
}
