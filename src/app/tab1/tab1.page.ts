import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActionSheetController, MenuController, ModalController } from '@ionic/angular';
import * as Leaflet from "leaflet";
import { antPath } from 'leaflet-ant-path';
import { LinkConfigurationComponent } from '../shared/components/link-configuration/link-configuration.component';
import { SettingsService } from '../services/settings.service';
import { GeoPoint } from '../shared/models/geographic';
// import "leaflet-control-geocoder/dist/Control.Geocoder.scss";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  @ViewChild("mapContainer") mapContainer: ElementRef;

  map: Leaflet.Map;
  popup = Leaflet.popup({closeOnClick: false, autoClose: false, closeButton: true});
  markersArray: any[] = [];
  antPathArray: any[] = [];

  greenIcon = Leaflet.icon({
    iconUrl,
    shadowUrl,
    iconRetinaUrl,
    iconSize:     [20, 30], // size of the icon
    shadowSize:   [20, 40], // size of the shadow
    iconAnchor:   [9, 29], // point of the icon which will correspond to marker's location
    shadowAnchor: [5, 39],  // the same for the shadow
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  createMaker: boolean = false;

  constructor(private actionSheetController: ActionSheetController,
              private menu: MenuController,
              private linkModalCtrl: ModalController,
              private settingsService: SettingsService) {}

  ngOnInit() {

    this.map = Leaflet.map('map', {
      center: [ 10.47171037405172, -68.00860921058162 ],
      zoom: 15,
      renderer: Leaflet.canvas(),
    })

    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      // maxZoom: 12,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map)


    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    // Adding geocoder

    (Leaflet.Control as any).geocoder({
      placeholder: "Buscar...",
      errorMessage: "No encontrado",
      iconLabel: "Iniciar busqueda"
    }).addTo(this.map);

  // Leaflet.marker([10.468190075498294, -68.01362568059086], {icon: this.greenIcon}).addTo(this.map).bindPopup('Hi').openPopup();
  // Leaflet.marker([10.467063961652615, -68.00759845883557],  {icon: this.greenIcon}).addTo(this.map).bindPopup('Hello').openPopup();
  
  // antPath([[10.468190075498294, -68.01362568059086], [10.467063961652615, -68.00759845883557]],
  //   { color: '#FF0000', weight: 5, opacity: 0.6 })
  //   .addTo(this.map);

    const onMapClick = (e) => {

      let latCropped: string = e.latlng.lat.toString();
      let lngCropped: string = e.latlng.lng.toString();

      this.presentActionSheet( Number(latCropped.substring(0, 9)), Number(lngCropped.substring(0, 9)), e);

      // this.createMaker = true;
    
      // console.log("You clicked the map at " + e.latlng)
      // this.popup
      //     .setLatLng(e.latlng)
      //     .setContent('<button (click)="helloWorld()">Hello</button>' + latCropped.substring(0, 9) + ","  + lngCropped.substring(0, 9))
      //     .openOn(this.map);

    };

    this.map.on('click', onMapClick);

    const onPopupRemoved = (e) => {
      console.log('pop up closed')
      e.preventDefault();
    }

    this.popup.on('remove', onPopupRemoved);

  }

  async presentActionSheet(lat: number, long: number, e) {

    const actionSheet = await this.actionSheetController.create({
      header: 'ACCIONES',
      buttons: [
        { 
          text: 'Colocar marcador en: ' + lat + ", " + long,
          icon: 'location-outline',
          handler: () => {
            this.setMarker(e);
          }
        },
      ],
    });

    await actionSheet.present();
  }

  async linkConfiguration() {
    const modal = await this.linkModalCtrl.create({
      component: LinkConfigurationComponent,
    });
    modal.present();
  }

  openConfiguration() {
    this.menu.open('first');
  }

  setMarker(event) {

    if (this.markersArray.length === 2) {
      this.map.removeLayer(this.markersArray[0]);
      this.markersArray.shift();
    }

    if (this.antPathArray.length === 1) {
      this.map.removeLayer(this.antPathArray[0]);
      this.antPathArray.shift();
    }

    let marker = Leaflet.marker([event.latlng.lat, event.latlng.lng], {icon: this.greenIcon}).addTo(this.map);
    this.markersArray.push(marker);

    // Leaflet.marker([event.latlng.lat, event.latlng.lng],  {icon: this.greenIcon}).addTo(this.map).bindPopup('Hello').openPopup();
    
    if (this.markersArray.length === 2) {

      let antPathVar = antPath([
        [this.markersArray[0].getLatLng().lat, this.markersArray[0].getLatLng().lng],
        [this.markersArray[1].getLatLng().lat, this.markersArray[1].getLatLng().lng]
      ],{
        color: '#FF0000', 
        weight: 5, 
        opacity: 0.6,

      }).addTo(this.map);

      this.antPathArray.push(antPathVar);
    }

    this.updateGeoPoints(this.markersArray);

  }

  updateGeoPoints(markers: any[]) {

    markers.forEach((marker, index) => {

      let point: GeoPoint = {
        lat: marker.getLatLng().lat,
        lng: marker.getLatLng().lng
      }

      if (index === 0) {
        this.settingsService.initialPoint.next(point);
      } else {
        this.settingsService.finalPoint.next(point);
      }
    })

  }
    
  ngAfterViewInit(): void {
    // const onMapClicked = (e) => {
      
    //   console.log('Clicked!')
    // };
    // this.mapContainer.nativeElement.addEventListener('click', onMapClicked );
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    
  }

}
