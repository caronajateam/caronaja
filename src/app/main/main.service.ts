import { Observable } from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreCollectionGroup,
} from '@angular/fire/firestore';
import { Room } from './../shared/model/room.interface';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { User } from '../shared/model/user.interface';

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
  testeUser;


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


}
