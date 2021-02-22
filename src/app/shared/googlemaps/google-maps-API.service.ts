import { User } from './../model/user.interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsAPIService {



  getPropretiesRoute(origin: {address, latitude, longitude}, destination: {address, latitude, longitude}):Promise<number> {
    let matrix = new google.maps.DistanceMatrixService();
    let distance: number;
    return new Promise((resolve)=>{
      matrix.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(Number(origin.latitude), Number(origin.longitude))],
          destinations: [new google.maps.LatLng(Number(destination.latitude),Number(destination.longitude))],
          travelMode: google.maps.TravelMode.DRIVING,
        }, (response, status) => {
          distance =  response.rows[0].elements[0].distance.value;
          return resolve(distance)
        }
      );
    })
  }

}
