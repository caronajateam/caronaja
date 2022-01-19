import { RoleValidator } from './../helpers/roleValidator';
import { User } from './../../shared/model/user.interface';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { first, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends RoleValidator {
  baseUrlApiGetLatLng: string =
    'https://maps.googleapis.com/maps/api/geocode/json?address=';

  public user$: Observable<User>;

  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore, private http:HttpClient) {
    super();
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        }
        return of(null);
      })
    );
  }

  getLatLng(adress: string) {
    let urlApi =
      this.baseUrlApiGetLatLng + adress + '&key=AIzaSyCuIEMW_tf4jNrtJaaSsS02l9TzFvM6YN4';
    return this.http.get(urlApi);
  }

  async sendVerificationEmail(): Promise<void> {
    return await (await this.afAuth.currentUser).sendEmailVerification();
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const { user } = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  async register(
    email: string,
    password: string,
    displayName: string,
    number: string,
    homeAdress: {address, latitude, longitude },
    workAdress: {address, latitude, longitude}
  ): Promise<any> {
    try {
      const { user } = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      this.sendVerificationEmail();

      this.updateUserData(user, displayName, number, homeAdress, workAdress);
      return user;
    } catch (error) {
      console.log(error);
      return error.code;
    }
  }

  async logout() {
    try {
      await this.afAuth.signOut();
    } catch (error) {
      console.log(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      return this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log(error);
    }
  }

  private updateUserData(
    user: User,
    displayName: string,
    number: string,
    homeAdress: {address, latitude, longitude },
    workAdress: {address, latitude, longitude}
  ) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );

    const data: User = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: displayName,
      number: number,
      photoURL: user.photoURL,
      homeAdress: homeAdress,
      workAdress: workAdress,
      role: 'ADMIN',
      iconMap: 'https://marketingspot.com.br/cimages/Logo02.png'
    };
    return userRef.set(data, { merge: true });
  }

  private updateUserDataGoogle(user: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );

    const data: User = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: 'ADMIN',
    };
    return userRef.set(data, { merge: true });
  }
}
