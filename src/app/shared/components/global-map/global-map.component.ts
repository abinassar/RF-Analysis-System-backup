import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActionSheetController, MenuController, ModalController } from '@ionic/angular';
import * as Leaflet from "leaflet";
import { antPath } from 'leaflet-ant-path';
import { SettingsService } from '@shared/services/settings.service';
import { GeoPoint } from '@shared/models/geographic';
// import "leaflet-control-geocoder/dist/Control.Geocoder.scss";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";

// Compass imports

import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { HomeService } from 'src/app/pages/home/home.service';
import { Router } from '@angular/router';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';

@Component({
  selector: 'app-global-map',
  templateUrl: './global-map.component.html',
  styleUrls: ['./global-map.component.scss'],
})
export class GlobalMapComponent implements OnDestroy, OnChanges {

  @ViewChild("mapContainer") mapContainer: ElementRef;
  @Output() showFullScreenMap = new EventEmitter<void>();
  @Output() sendPoint = new EventEmitter<GeoPoint>();
  @Input() insideComponent: boolean = false;
  @Input() P1: GeoPoint;
  @Input() P2: GeoPoint;

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
  displayMap: boolean = true;

  constructor(private actionSheetController: ActionSheetController,
              private menu: MenuController,
              private linkModalCtrl: ModalController,
              private settingsService: SettingsService,
              private deviceOrientation: DeviceOrientation,
              private geolocation: Geolocation,
              private homeService: HomeService,
              private screenOrientation: ScreenOrientation,
              private router: Router) {


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

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['P1'].currentValue
        && changes['P1'].currentValue.lng !== 0
        && changes['P1'].currentValue.lat !== 0) {

      setTimeout(() => {
        
        this.addMarker(changes['P1'].currentValue);
        
      }, 500);

    }

    if (changes['P2'].currentValue
        && changes['P2'].currentValue.lng !== 0
        && changes['P2'].currentValue.lat !== 0) {

      setTimeout(() => {
        
        this.addMarker(changes['P2'].currentValue)
      }, 500);

      
    }    
  }

  landscapeOrientation() {

    if (this.insideComponent) {

      this.showFullScreenMap.emit();
      
    } else {

      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);

    }

  }

  portraitOrientation() {
    if (!this.insideComponent) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
  }

  refreshMap() {
    this.map.off();
    this.map.remove();
    this.initMap();
    this.setInitialPoints();
  }

  initMap() {

    this.map = Leaflet.map("map", {
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

    const onPopupRemoved = (e: any) => {
      console.log('pop up closed')
      e.preventDefault();
    }

    this.popup.on('remove', onPopupRemoved);

  }

  hideMap() {

    this.displayMap = false;

    // Ocultar el mapa

    document.getElementById('map').style.display = 'none';

  }

  showMap() {

    this.displayMap = true;

    // Mostrar el mapa

    document.getElementById('map').style.display = '';

  }

  ngOnInit() {

    this.displayMap = true;
    this.initMap();

  }

  setInitialPoints() {

    if (this.settingsService.linkSettings.P1.lng !== 0
        && this.settingsService.linkSettings.P1.lat !== 0) {

      this.addMarker(this.settingsService.linkSettings.P1, false);
      
    }

    if (this.settingsService.linkSettings.P2.lng !== 0
        && this.settingsService.linkSettings.P2.lat !== 0) {

      this.addMarker(this.settingsService.linkSettings.P2, false);
      
    }    
  }

  async presentActionSheet(lat: number, long: number, e) {

    const actionSheet = await this.actionSheetController.create({
      header: 'ACCIONES',
      buttons: [
        { 
          text: 'Colocar marcador en: ' + lat + ", " + long,
          icon: 'location-outline',
          handler: () => {

            let point: GeoPoint = {
              lat: e.latlng.lat,
              lng: e.latlng.lng
            }

            this.addMarker(point);
          }
        },
      ],
    });

    await actionSheet.present();
  }

  openConfiguration() {
    this.menu.open('first');
  }

  addMarker(point: GeoPoint,
            updateGeopoints: boolean = true) {

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

    let marker = Leaflet.marker([point.lat, point.lng], {icon: this.greenIcon}).addTo(this.map);
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

    if (updateGeopoints) this.updateGeoPoints(this.markersArray);

  }

  updateGeoPoints(markers: any[]) {

    markers.forEach((marker, index) => {

      let point: GeoPoint = {
        lat: Number(marker.getLatLng().lat.toString().substring(0, 10)),
        lng: Number(marker.getLatLng().lng.toString().substring(0, 11))
      }

      // Update point in the properties
      // Shared with another components

      if (index === 0) {

        this.settingsService.linkSettings.P1 = point;

      } else {

        this.settingsService.linkSettings.P2 = point;

      }
    });

    this.settingsService.updateGeoPoints.next();

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

  clearMap() {
    this.map.off();
    this.map.remove();
  }

  resetMap() {
    this.map.off();
    this.map.remove();
  }

  ngOnDestroy(): void {
    // console.log("deleting map component")
    // this.homeService.showMap = false;
  }

}

