import { Observable } from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreCollectionGroup,
} from '@angular/fire/firestore';
import { Room } from './../shared/model/room.interface';
import { Injectable } from '@angular/core';
import { map, first } from 'rxjs/operators';
import { User } from '../shared/model/user.interface';
import { Car } from '../shared/model/car.interface';
import { FIREBASE_OPTIONS } from '@angular/fire';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  rooms: Observable<Room[]>;
  roomsConvidado: Observable<Room[]>;
  roomsConvidadoTeste: Room[];
  users: Observable<User[]>;
  usersConvidado: Observable<User[]>;
  room: Observable<Room>;
  car: Observable<Car>;
  user: Observable<User[]>;
  userCarMembers: Observable<User[]>;
  testeUser;
  membersOfCarToShow: Observable<User[]>;



  private roomsCollection: AngularFirestoreCollection<Room>;
  private roomsConvidadoCollection: AngularFirestoreCollection<Room>;
  private usersConvidadoCollection: AngularFirestoreCollection<User>;
  private usersPropertyCollection: AngularFirestoreCollection<User>;


  constructor(private readonly afs: AngularFirestore) {
    this.roomsCollection = afs.collection<Room>('rooms');
    this.roomsConvidadoCollection = afs.collection<Room>('rooms');
    this.usersConvidadoCollection = afs.collection<User>('users');
    this.usersPropertyCollection = afs.collection<User>('users');

  }

  salvarSala(room: Room) {
    const roomUid = this.afs.createId();
    room.uidRoom = roomUid;
    this.afs.doc(`rooms/${roomUid}`).set(room);
    return roomUid;
  }


  salvarUsuarioNaSala(user:User, uidRoom:string){
    user.driver = false;
    user.ride = 0;
    user.distance = 0;
    this.afs.doc(`rooms/${uidRoom}/members/${user.uid}`).set(user);
  }

  salvarSalaNoUsuario(uidUserRef:string, room:Room){
    this.afs.doc(`users/${uidUserRef}/rooms/${room.uidRoom}`).set(room);
  }



  getRoom(uidUserRef: string): Observable<Room[]>{
    this.roomsCollection = this.afs.collection<Room>('rooms', (ref) =>
    ref.where('uidUser', '==', uidUserRef)
  );

  return (this.rooms = this.roomsCollection
    .snapshotChanges()
    .pipe(
      map((actions) => actions.map((a) => a.payload.doc.data() as Room))
    ));
  }

  getUsers(uidUserMember:string):Observable<User[]> {
    this.usersPropertyCollection = this.afs.collection<User>('users', (ref) =>
    ref.where('uid', '==', uidUserMember)
  );

  return (this.users = this.usersPropertyCollection
    .snapshotChanges()
    .pipe(
      map((actions) => actions.map((a) => a.payload.doc.data() as User))
    ));
  }

  getOneRoom(uidRoom:string){
    this.room = this.afs.collection('rooms').doc<Room>(uidRoom).valueChanges();
    return this.room;
  }

  getOneUser(uidUser:string){
    this.testeUser = this.afs.collection('users').doc<User>(uidUser).valueChanges();
    return this.testeUser;
  }

  getOneUserFromRoom(uidUser: string, uidRoom:string){
    return this.afs.collection('rooms').doc(uidRoom).collection('members').doc(uidUser).valueChanges();
  }

  getCar(uidUser: string, uidRoom:string){
    return this.afs.collection('users').doc(uidUser).collection('rooms').doc(uidRoom).collection('car').doc(uidUser).valueChanges();
  }

  membersOfRoom(uidRoom:string){
    this.users = this.afs.collection('rooms').doc(uidRoom).collection('members').valueChanges();
    return this.users;
  }


  getRoomConvidado(uidUserRef:string){

  this.roomsConvidadoCollection = this.afs.collection('users').doc(uidUserRef).collection('rooms', (ref) =>
  ref.where('uidUser', '!=', uidUserRef));

  return (this.roomsConvidado = this.roomsConvidadoCollection
    .snapshotChanges()
    .pipe(
      map((actions) => actions.map((a) => a.payload.doc.data() as Room))
    ));

  }

  deleteRoom(uidRoom, uidUserRef){
    this.afs.collection('rooms').doc(uidRoom).delete();
    this.afs.collection('users').doc(uidUserRef).collection('rooms').doc(uidRoom).delete();
  }

  leaveRoom(uidRoom, uidUserRef){
    this.afs.collection('users').doc(uidUserRef).collection('rooms').doc(uidRoom).delete();
    this.afs.collection('rooms').doc(uidRoom).collection('members').doc(uidUserRef).delete();
  }

  updateRoom(item: User, uidRoom){
    this.afs.collection('rooms').doc(uidRoom).collection('members').doc(item.uid).set(item, { merge: true });
  }

  async updateUserInRoom(car: Car, uidUser){
    this.afs.collection('rooms').doc(car.uidRoomCar).collection('members').doc(uidUser).update({'distance': 1 });
  }

  updateUserInRoomZEROOO(uidRoom, uidUser){
    return this.afs.collection('rooms').doc(uidRoom).collection('members').doc(uidUser).update({'distance': 0 });
  }

  getUserDriver(uidRoom){
    this.user = this.afs.collection('rooms').doc(uidRoom).collection('members', (ref) =>
    ref.where('driver', '==', true)).valueChanges();
    return this.user;
  }

  getUserPassenger(uidRoom){
    this.userCarMembers = this.afs.collection('rooms').doc(uidRoom).collection('members', (ref) =>
    ref.where('driver', '==', false).where('distance', '==', 0)).valueChanges();
    return this.userCarMembers;
  }

  getCars(uidRoom){
    let cars: Observable<Car[]> = this.userCarMembers = this.afs.collection('rooms').doc(uidRoom).collection('cars').valueChanges();
    return cars;
  }

  getMembersOfCar(uidRoom: string, uidUserRef:string){
    this.membersOfCarToShow = this.afs.collection('users').doc(uidUserRef).collection('rooms').doc(uidRoom).collection('car').doc(uidUserRef).collection('carMembers').valueChanges();
    return this.membersOfCarToShow;
  }


  getMembersOfCar2(uidRoom, uidUserRef){
    let members = this.afs.collection('users').doc(uidUserRef).collection('rooms').doc(uidRoom).collection('car').valueChanges();
    return members;

}
  saveUserMembersOfCar(userMembersOfCar: User[], uidRoom, car: Car){
    this.afs.collection('rooms').doc(uidRoom).collection('cars').doc(car.uidDriver).set(car);
    this.afs.collection('users').doc(car.uidDriver).collection('rooms').doc(uidRoom).collection('car').doc(car.uidDriver).set(car)
    userMembersOfCar.forEach(element => {
      this.afs.collection('rooms').doc(uidRoom).collection('cars').doc(car.uidDriver).collection('carMembers').add(element);
      this.afs.collection('users').doc(car.uidDriver).collection('rooms').doc(uidRoom).collection('car').doc(car.uidDriver).collection('carMembers').add(element);
      userMembersOfCar.forEach(element2 => {
        this.afs.collection('users').doc(element.uid).collection('rooms').doc(uidRoom).collection('car').doc(element.uid).set(car)
        this.afs.collection('users').doc(element.uid).collection('rooms').doc(uidRoom).collection('car').doc(element.uid).collection('carMembers').add(element2);
      });
    });
  }





}
