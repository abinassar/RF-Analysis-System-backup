import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActionSheetController, MenuController, ModalController } from '@ionic/angular';
import * as Leaflet from "leaflet";
import { antPath } from 'leaflet-ant-path';
import { LinkConfigurationComponent } from '../../../../shared/components/link-configuration/link-configuration.component';
import { SettingsService } from '../../../../shared/services/settings.service';
import { GeoPoint } from '../../../../shared/models/geographic';
// import "leaflet-control-geocoder/dist/Control.Geocoder.scss";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";

// Compass imports

import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage {

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

  // Compass variables

  // We will call this variable on home.page.html file
  data: DeviceOrientationCompassHeading;
  public currentLocation: any = null;

  // Initial Kaaba location that we've got from google maps
  private kaabaLocation: {lat:number,lng:number} = {lat: 21.42276, lng: 39.8256687};

  // Initial Qibla Location
  public qiblaLocation = 0;

  constructor(private actionSheetController: ActionSheetController,
              private menu: MenuController,
              private linkModalCtrl: ModalController,
              private settingsService: SettingsService,
              private deviceOrientation: DeviceOrientation,
              private geolocation: Geolocation) {


    // Watch the device compass heading change
    this.deviceOrientation.watchHeading().subscribe((res: DeviceOrientationCompassHeading) => {
      this.data = res;
      // Change qiblaLocation when currentLocation is not empty 
      if (!!this.currentLocation) {
        const currentQibla = res.magneticHeading - this.getQiblaPosition();
        this.qiblaLocation = currentQibla > 360 ? currentQibla%360 : currentQibla;
      }
      }
    );

    // Watch the device compass heading change
    this.deviceOrientation.watchHeading().subscribe((res: DeviceOrientationCompassHeading) => {
      this.data = res;
    });

    // Watch current location
    this.geolocation.watchPosition().subscribe((res) => {
        this.currentLocation = res;
    });



  }

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

      // Remove first point marked 
      // In path

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

      // Update point in the properties
      // Shared with another components

      if (index === 0) {

        this.settingsService.initialPoint = point;

      } else {

        this.settingsService.finalPoint = point;

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

  // Compass logic

  getQiblaPosition() {
    // Convert all geopoint degree to radian before jump to furmula
    const currentLocationLat = this.degreeToRadian(this.currentLocation.coords.latitude);
    const currentLocationLng = this.degreeToRadian(this.currentLocation.coords.longitude);
    const kaabaLocationLat = this.degreeToRadian(this.kaabaLocation.lat);
    const kaabaLocationLng = this.degreeToRadian(this.kaabaLocation.lng);

    // Use Basic Spherical Trigonometric Formula
    return this.radianToDegree(
      Math.atan2(
        Math.sin(kaabaLocationLng-currentLocationLng),
        (Math.cos(currentLocationLat) * Math.tan(kaabaLocationLat) - Math.sin(currentLocationLat) * Math.cos(kaabaLocationLng - currentLocationLng))
      )
    );
  }

  /**
   * Convert from Radian to Degree
   * @param radian 
   */
  radianToDegree(radian: number) {
    return radian * 180 / Math.PI;
  }

  /**
   * Convert from Degree to Radian
   * @param degree 
   */
  degreeToRadian(degree: number) {
    return degree * Math.PI / 180;
  }

}

