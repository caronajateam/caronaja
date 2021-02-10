import { GoogleGetaddressService } from './../../shared/googlemaps/google-places/google-getaddress.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Room } from './../../shared/model/room.interface';
import { MainService } from './../main.service';
import { Observable } from 'rxjs';
import { AuthService } from './../../auth/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/model/user.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  public user$: Observable<User> = this.authSvc.afAuth.user;
  userObservable:Observable<User>;
  userTeste: User;
  roomObservable:Observable<Room>;
  roomTeste:Room;

  address:{address, latitude, longitude};


  closeResult = '';

  room: Room = {};
  rooms$: Observable<Room[]>;

  roomEntrar: Room = {};



  navigationExtras: NavigationExtras = {
    state: {
      value: null,
    },
  };

  uidUserRef;

  uidRoom;

  uidRoomEntrar;

  roomsConvidado:Observable<Room[]>;

  userConvidado;


  constructor(
    private authSvc: AuthService,
    private modalService: NgbModal,
    private mainSvc: MainService,
    private router: Router,
    private route: ActivatedRoute,
    private getaddr: GoogleGetaddressService
  ) {

   }


  ngOnInit(): void {

    this.user$.subscribe(resp=> {
      if(resp == null){
        this.router.navigate(['login'])
      }

      this.uidUserRef = resp.uid;

      this.userObservable = this.mainSvc.getOneUser(this.uidUserRef);
      this.userObservable.subscribe(
        user => {
          this.userTeste = user;
          this.route.params.subscribe(par=>{
            if(par['uidRoomUrl']){
              this.uidRoomEntrar = par.uidRoomUrl;
              this.onEntrarSalaUser();
            }
          });
        }
      )
      this.rooms$ = this.onRooms(this.uidUserRef);
      this.roomsConvidado = this.onRoomsConvidado(this.uidUserRef);
    });
  }


  onGetEstablishmentAddress(place: object | any){
    this.getaddr.getEstablishmentAddress(place).then(
      (coords) => {
       this.address = coords;
        console.log(this.address);
      this.room.roomAdress = this.address;
      }
    )
   }

  onGetAddress(place: object | any){
    this.getaddr.getAddress(place).then(
      (coords) => {
       this.address = coords;
        console.log(this.address);
      this.room.roomAdress = this.address;
      }
    )
   }

  onSalvarSala() {
    this.room.uidUser = this.uidUserRef;
    this.uidRoom = this.mainSvc.salvarSala(this.room);
    this.mainSvc.salvarUsuarioNaSala(this.userTeste, this.uidRoom);
    this.mainSvc.salvarSalaNoUsuario(this.uidUserRef, this.room);
  }

  open(content) {
    this.modalService.open(content);
  }

  openSala(entrarsala) {
    this.modalService.open(entrarsala);
  }

  onEntrarSalaViaWhats(){

  }


  onEntrarSalaUser(){
    this.navigationExtras.state.value = this.uidRoomEntrar;
    this.mainSvc.salvarUsuarioNaSala(this.userTeste,this.uidRoomEntrar);

    this.roomObservable = this.mainSvc.getOneRoom(this.uidRoomEntrar);
    this.roomObservable.subscribe(resp=>{
      this.roomTeste = resp;

      this.getRoomFromRoom();
      this.mainSvc.salvarSalaNoUsuario(this.uidUserRef, this.roomTeste);

      this.router.navigate(['room'], this.navigationExtras)
    });

  }

  onGoToRoom(item:any){
    this.navigationExtras.state.value = item.uidRoom;
    this.router.navigate(['room'], this.navigationExtras);
  }

  getUserFromUser(){
    this.userObservable.subscribe(
      user => {
        this.userTeste = user;
      }
    )
  }

  getRoomFromRoom(){
    this.roomObservable.subscribe(
      room => {
        this.roomTeste = room;
      }
    )
  }

  onRooms(uidUserRef:string){
    return this.mainSvc.getRoom(uidUserRef);
  }

  onRoomsConvidado(uidUserRef:string){
    return this.mainSvc.getRoomConvidado(uidUserRef);
  }

  onDelete(item:Room){
    this.mainSvc.deleteRoom(item.uidRoom, this.uidUserRef);
  }

  onSair(item:Room){
    this.mainSvc.leaveRoom(item.uidRoom, this.uidUserRef);
  }



}