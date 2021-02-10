import { Component, ViewChild, EventEmitter, Output, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'GooglePlacesComponent',
    template: `
      <input class="input"
        type="text"
        [(ngModel)]="autocompleteInput"
        #addresstext style="padding: 12px 20px; border: 1px solid #ccc; width: 400px"
        >
    `,
})
export class GooglePlacesComponent implements OnInit, AfterViewInit {
    @Input() adressType: string | any;
    @Output() setAddress: EventEmitter<any> = new EventEmitter();
    @ViewChild('addresstext') addresstext: any;

    autocompleteInput: string | any;
    queryWait: boolean | any;

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.getPlaceAutocomplete();
    }

    private getPlaceAutocomplete() {
        const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
            {
                componentRestrictions: { country: 'BR' },
                types: [this.adressType]
            });
        google.maps.event.addListener(autocomplete, 'place_changed', () => {
            const place = autocomplete.getPlace();
            this.invokeEvent(place);

        });
    }

    invokeEvent(place: Object) {
        this.setAddress.emit(place);
    }

}
