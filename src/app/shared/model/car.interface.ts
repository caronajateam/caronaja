export interface Car {


  uidCar?:string;
  uidDriver?:string;
  origin?:{address, latitude, longitude};
  destination?:{address, latitude, longitude};
  lugares?:number;
  count?:number;
  distance?:number;
  displayNameDriver?:string;
  numberDriver?:string;
  photoURLDriver?: string;
  uidRoomCar?:string;

}
