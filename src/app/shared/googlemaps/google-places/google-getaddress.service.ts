import { AuthService } from './../../../auth/services/auth.service';
import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoogleGetaddressService {
  address: Object | any;
  lat: string | any = 0;
  lng: string | any = 0;
  formattedAddress: string | any;
  phone: string | any;
  addressFormated: string | any;
  homeAdressLatLng: { address; latitude; longitude } = null;
  establishmentAddress: string | any;
  formattedEstablishmentAddress: string | any;

  constructor(private authSvc: AuthService, private zone: NgZone) {}

  getEstablishmentAddress(place: object | any): Promise<{ address; latitude; longitude }> {
    this.establishmentAddress = place['formatted_address'];
    this.phone = this.getPhone(place);
    this.formattedEstablishmentAddress = place['formatted_address'];
    this.zone.run(() => {
      this.formattedEstablishmentAddress = place['formatted_address'];
      this.phone = place['formatted_phone_number'];
    });

    return new Promise((resolve) => {
      this.authSvc.getLatLng(this.formattedEstablishmentAddress).subscribe((resp: any) => {
        console.log(resp.results[0].geometry.location.lat);
        console.log(resp.results[0].geometry.location.lng);
        this.lat = resp.results[0].geometry.location.lat;
        this.lng = resp.results[0].geometry.location.lng;
        if(place.business_status == null){
          this.formattedEstablishmentAddress =
          place.address_components[1].short_name +
          ', ' +
          place.address_components[0].long_name +
          ' - ' +
          place.address_components[2].long_name;
        }else {
          this.formattedEstablishmentAddress = place.name;
        }
        this.homeAdressLatLng = {
          address: this.formattedEstablishmentAddress,
          latitude: this.lat,
          longitude: this.lng,
        };

        return resolve(this.homeAdressLatLng);
      });
    });

  }

  getAddress(place: object | any): Promise<{ address; latitude; longitude }> {
    this.address = place['formatted_address'];
    this.phone = this.getPhone(place);
    this.formattedAddress = place['formatted_address'];
    this.zone.run(() => (this.formattedAddress = place['formatted_address']));
    return new Promise((resolve) => {
      this.authSvc.getLatLng(this.formattedAddress).subscribe((resp: any) => {
        console.log(resp.results[0].geometry.location.lat);
        console.log(resp.results[0].geometry.location.lng);
        this.lat = resp.results[0].geometry.location.lat;
        this.lng = resp.results[0].geometry.location.lng;
        if(place.business_status == null){
          this.formattedAddress =
          place.address_components[1].short_name +
          ', ' +
          place.address_components[0].long_name +
          ' - ' +
          place.address_components[2].long_name;
        }else {
          this.formattedAddress = place.name;
        }
        this.homeAdressLatLng = {
          address: this.formattedAddress,
          latitude: this.lat,
          longitude: this.lng,
        };

        return resolve(this.homeAdressLatLng);
      });
    });
  }

  getAddrComponent(place: any, componentTemplate: any) {
    let result;

    for (let i = 0; i < place.address_components.length; i++) {
      const addressType = place.address_components[i].types[0];
      if (componentTemplate[addressType]) {
        result = place.address_components[i][componentTemplate[addressType]];
        return result;
      }
    }
    return;
  }

  getPhone(place: any) {
    const COMPONENT_TEMPLATE = {
        formatted_phone_number: 'formatted_phone_number',
      },
      phone = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return phone;
  }
}
