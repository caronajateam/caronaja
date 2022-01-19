import { GoogleMapsAPIService } from './../../shared/googlemaps/google-maps-API.service';
import { MainService } from './../main.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/shared/model/user.interface';
import { Room } from 'src/app/shared/model/room.interface';
import { Car } from 'src/app/shared/model/car.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore'

@Injectable({
  providedIn: 'root'
})
export class CarService {

constructor(private mainSvc: MainService, private googleSvc: GoogleMapsAPIService) { }

  distance: number;
  userDriver: User[];

  car:Car;
  carSave: Car;
  users: User[];


  getUserDriver(room: Room): Promise<User[]>{
      return new Promise((resolve) => {
        this.mainSvc.getUserDriver(room.uidRoom).subscribe((resp)=>{
          this.userDriver = resp;
          console.log('carService - getUserDriver',this.userDriver)
          return resolve(this.userDriver);
         });
      });
  }

  async createCar(room:Room){

    let userDriver: User[] = await this.getUserDriver(room);
    let cars: Array<Car> = [];

    for (let index = 0; index < userDriver.length; index++) {
      let distance = await this.googleSvc.getPropretiesRoute(room.roomAdress, userDriver[index].homeAdress);

      let car: Car = {};
      car = {
        numberDriver: userDriver[index].number,
        uidRoomCar: room.uidRoom,
        displayNameDriver: userDriver[index].displayName,
        origin: room.roomAdress,
        destination: userDriver[index].homeAdress,
        lugares: userDriver[index].ride,
        count:0,
        distance: distance,
        uidDriver: userDriver[index].uid
      };
      cars.push(car);
    }
    return cars;
  }

  //**********************Membros do carro! */


  getUserPassenger(room: Room): Promise<User[]>{
    return new Promise((resolve) => {
      this.mainSvc.getUserPassenger(room.uidRoom).subscribe((resp)=>{
        let userPassenger = resp;
        // console.log(userPassenger)
        return resolve(userPassenger);
       });
    });
  }

  getCars(room: Room): Promise<Car[]>{
    return new Promise((resolve) => {
      this.mainSvc.getCars(room.uidRoom).subscribe((resp)=>{
        let cars = resp;
        // console.log(userPassenger)
        return resolve(cars);
       });
    });
  }

  async matchNow(room: Room){
    let cars: Array<Car> = [];;

    cars = await this.createCar(room);
    cars.forEach(element => {
      console.log(cars);

    });
    // await this.checkCarMembers(cars,room )
    for (let index = 0; index < cars.length; index++) {
      let membersOfCar = await this.getMembersOfCar(cars[index], room);
      this.saveUserMembersOfCarFirestore(membersOfCar, room.uidRoom, cars[index]);
    }
  }


  // async checkCarMembers(cars: Car[], room){
  //   let membersOfAllCar: { car: {membersOfCar: User[]}[] };
  //   // for (let i = 0; i < cars.length; i++) {
  //     for (let j = 0; j < cars.length; j++) {

  //       let membersOfCar = await this.getMembersOfCar(cars[j], room);
  //       console.log('membersOfCar');
  //       console.log(membersOfCar);


  //       membersOfAllCar.car;


  //     }


  // }


  async getMembersOfCar(car: Car, room: Room): Promise<User[]>{

    console.log('carService - getMembersOfCar')
    //2000 é a distancia que motorista permite aumentar na rota dele
    let distanceCar: number = car.distance + 2000;
    console.log('carService - getMembersOfCar', distanceCar)
    let lugares = car.lugares;
    let lugaresAux = 0;
    let userPassenger = await this.getUserPassenger(room)
    let userPossibleMembers:Array<User> = [];
    let userMembersOfCar: Array<User> = [];


    let count = 0;

    let closestUserPossible: User;
    let indexOfclosestUserPossible: number;
    let closestDistanceUserPossible: number = 99999999999999;
    let closestDistanceOriginUserPossible: number;


    console.log('lista completa de passageiros');
    if(userPassenger != []){
      userPassenger.forEach(element => {
        console.log(element);
      });

    }


    count = 0;
    for (let index = 0; index < userPassenger.length; index++) {
      userPassenger[index].distanceOrigin = await this.googleSvc.getPropretiesRoute(car.origin,  userPassenger[index].homeAdress);
      userPassenger[index].distanceDestination = await this.googleSvc.getPropretiesRoute(userPassenger[index].homeAdress, car.destination);
      if(userPassenger[index].distanceDestination + userPassenger[index].distanceOrigin <= distanceCar){
        userPossibleMembers[count] = userPassenger[index];
        count++;
      }
    }
    console.log('lista de possives passageiros');
    userPossibleMembers.forEach(element => {
      console.log(element);
    });


//Passageiro com a rota mais perto!!




    for (let index = 0; index < userPossibleMembers.length; index++) {
      if(userPossibleMembers[index].distanceOrigin + userPossibleMembers[index].distanceDestination <= closestDistanceUserPossible){
        closestDistanceUserPossible = userPossibleMembers[index].distanceOrigin + userPossibleMembers[index].distanceDestination;
        closestUserPossible = userPossibleMembers[index];
        closestDistanceOriginUserPossible = userPossibleMembers[index].distanceOrigin;
        indexOfclosestUserPossible = index;
      }
    }
    console.log('passageiro mais perto!', closestUserPossible);


    if ( indexOfclosestUserPossible > -1) {
      userPossibleMembers.splice(indexOfclosestUserPossible, 1);
      userMembersOfCar.push(closestUserPossible);
      await this.saveIfMemberHasRide(car, closestUserPossible.uid);
    }


    console.log('lista de possiveis passageiros');
    userPossibleMembers.forEach(element => {
      console.log(element);
    });

    console.log('lista de passageiros');
    userMembersOfCar.forEach(element => {
      console.log(element);
    });

    let otherClosestUserPossible: User;
    let otherClosestDistanceUserPossible: number = 99999999999999;
    let indexOfOtherClosestUserPossible:number;
    let origin;
    let mid;
    let destination;


    for (let j = lugaresAux; j < lugares;) {
      if(userPossibleMembers.length == 0){
        break;
      }
      if(userMembersOfCar.length == lugares){
        break;
      }

      for (let i = 0; i < userPossibleMembers.length; i++) {

        if(userPossibleMembers.length == 0){
          break;
        }
        if(userMembersOfCar.length == lugares){
          break;
        }

        if(userPossibleMembers.length != 0){

          otherClosestDistanceUserPossible = 99999999999999;
          otherClosestUserPossible = null;

          for (let ot = 0; ot < userPossibleMembers.length; ot++) {
            if(userPossibleMembers[ot].distanceOrigin + userPossibleMembers[ot].distanceDestination <= otherClosestDistanceUserPossible){
              otherClosestDistanceUserPossible = userPossibleMembers[ot].distanceOrigin + userPossibleMembers[ot].distanceDestination;
              otherClosestUserPossible = userPossibleMembers[ot];
              indexOfOtherClosestUserPossible = ot;
            }
          }

            if(userPossibleMembers.length != 0){


              if ( indexOfOtherClosestUserPossible > -1) {
                userPossibleMembers.splice(indexOfOtherClosestUserPossible, 1);
              }

              console.log('otherClosestUserPossible');
              console.log( otherClosestUserPossible );


              //COMPARAÇÃO DE DISTANCIAS

                  origin = 99999999999;
                  destination = 99999999999;

                let destinationMember = 99999999999;
                let destinationOther = await this.googleSvc.getPropretiesRoute(otherClosestUserPossible.homeAdress, car.destination);
                for (let o = 0; o < userMembersOfCar.length; o++) {
                  let destinationAux = await this.googleSvc.getPropretiesRoute(userMembersOfCar[o].homeAdress, car.destination);
                  if(destinationAux <= destinationMember){
                    destinationMember = destinationAux;
                  }
                }

                  console.log('TOPOOOOOOOOOOO')
                  console.log('destinationMember',destinationMember)
                  console.log('destinationOther',destinationOther)

                  if(destinationOther <= destinationMember){

                    destination = destinationOther;

                    let midOther;
                    let originMember;

                    midOther = 99999999999;
                    for (let index = 0; index < userMembersOfCar.length; index++) {
                      let midAux = await this.googleSvc.getPropretiesRoute(userMembersOfCar[index].homeAdress, otherClosestUserPossible.homeAdress);
                      if(midAux <= midOther){
                        midOther = midAux;
                      }
                    }

                    mid = 0;
                    mid = await this.distanceBetweenMembers(userMembersOfCar) + midOther;

                    originMember = 99999999999;
                    for (let index = 0; index < userMembersOfCar.length; index++) {
                      let originAux = await this.googleSvc.getPropretiesRoute(car.origin ,userMembersOfCar[index].homeAdress);
                      if(originAux <= originMember){
                        originMember = originAux;
                      }
                    }
                    origin = 0;
                    origin = originMember;

                console.log('onde originOther <= originMember origin:', origin);
                console.log('onde originOther <= originMember mid:', mid);
                console.log('onde originOther <= originMember destination:', destination);

              } else {

                destination = destinationMember;

                let originMember = 99999999999;
                  let originOther = await this.googleSvc.getPropretiesRoute(car.origin,  otherClosestUserPossible.homeAdress);
                  for (let index = 0; index < userMembersOfCar.length; index++) {
                    let originAux = await this.googleSvc.getPropretiesRoute(car.origin, userMembersOfCar[index].homeAdress);
                    if(originAux <= originMember){
                      originMember = originAux;
                    }
                  }

                let midOther = 99999999999;

                if(originOther <= originMember){


                  midOther = 99999999999;
                  for (let index = 0; index < userMembersOfCar.length; index++) {
                    let midAux = await this.googleSvc.getPropretiesRoute(otherClosestUserPossible.homeAdress, userMembersOfCar[index].homeAdress);
                    if(midAux <= midOther){
                      midOther = midAux;
                    }
                  }

                  mid = 0;
                  mid = await this.distanceBetweenMembers(userMembersOfCar) + midOther;

                  origin = 0;
                  origin = originOther;

                  console.log('onde else - destinationOther <= destinationMember origin: ',origin)

                  console.log('onde else - destinationOther <= destinationMember midOther: ',midOther)
                  console.log('onde else - destinationOther <= destinationMember midFUNCT: ',mid -midOther )
                  console.log('onde else - destinationOther <= destinationMember mid: ',mid)

                  console.log('onde else - destinationOther <= destinationMember dest:', destination)

                } else{

                  mid = 0;
                  mid = await this.distanceBetweenMembers(userMembersOfCar, otherClosestUserPossible);

                  destination = 0;
                  destination = destinationMember;

                  origin = 0;
                  origin = originMember;

                  console.log('onde else - else origin:', origin);
                  console.log('onde else - else mid:', mid);
                  console.log('onde else -else destination:', destination);
                }
            }
            if ((origin + mid + destination) <= distanceCar){
              userMembersOfCar.push(otherClosestUserPossible);
              await this.saveIfMemberHasRide(car, otherClosestUserPossible.uid);
              lugaresAux ++;
            }

            console.log('lista de possiveis passageiros, depois de destination');
            userPossibleMembers.forEach(element => {
              console.log(element);
            });
            console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
            console.log(userPossibleMembers);

            console.log('lista de passageiros do carro, depois de destination');
            userMembersOfCar.forEach(element => {
              console.log(element);
            });
          }else{
            lugaresAux = lugares;
          }
        }else{
          lugaresAux = lugares;
        }
      }

    }

    console.log('membros do carro final', car.displayNameDriver)
    userMembersOfCar.forEach(element => {
      console.log(element);
    });
    return userMembersOfCar;
  }


  saveUserMembersOfCarFirestore(userMembersOfCar: User[], uidRoom, car){
    this.mainSvc.saveUserMembersOfCar(userMembersOfCar, uidRoom, car);
  }


  async saveIfMemberHasRide(car: Car, uidUser){
    await this.mainSvc.updateUserInRoom(car, uidUser);
  }

  async saveIfMemberHasRideZEROOO(uidRoom, uidUser) {
    await this.mainSvc.updateUserInRoomZEROOO(uidRoom, uidUser);
  }

  async distanceBetweenMembers(userMembersOfCar: Array<User>, otherClosestUserPossible?: User): Promise<number>{
    let mid;
    let userMembersOfCarAux: Array<User> = [];
    userMembersOfCarAux = [];
    for (let index = 0; index < userMembersOfCar.length; index++) {
      userMembersOfCarAux.push(userMembersOfCar[index]);
    }
    if(otherClosestUserPossible){
      userMembersOfCarAux.push(otherClosestUserPossible);
    }
    let menorMid1;
    let menorMid2;
    let midAux;
    let mid1Inxex;
    let mid2Inxex;
    midAux = 0;
    console.log('NOVO AAAAAAAAAAAAAAAARRAEEEEEEEYYYYy',userMembersOfCarAux);
    for (let h = 0; h < userMembersOfCarAux.length; h++) {
      if(userMembersOfCarAux.length == 0){
        break;
      }
      menorMid1 = 99999999999;
      menorMid2 = 99999999999;
      for (let index = 0; index < userMembersOfCarAux.length; index++) {
        if(userMembersOfCarAux.length <= 2){
          break;
        }
        if(index != h){
          let mid1 = await this.googleSvc.getPropretiesRoute(userMembersOfCarAux[index].homeAdress, userMembersOfCarAux[h].homeAdress);
          if(mid1 <= menorMid1){
            menorMid1 = mid1;
            mid1Inxex = index;
          }
          let mid2 = await this.googleSvc.getPropretiesRoute(userMembersOfCarAux[h].homeAdress, userMembersOfCarAux[index].homeAdress);
          if(mid2 <= menorMid2){
            menorMid2 = mid2;
            mid2Inxex = index;
          }
          if(menorMid1 <= menorMid2){
            midAux = midAux + menorMid1;
            userMembersOfCarAux.splice(mid1Inxex, 1);
          }else {
            midAux = midAux + menorMid2;
            userMembersOfCarAux.splice(mid2Inxex, 1);
          }
        }
      }
    }
    mid = 0;
    mid = midAux;
    return mid;
  }
}
