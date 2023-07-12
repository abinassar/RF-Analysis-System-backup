import { Component } from '@angular/core';
import { SettingsService } from '@shared/services/settings.service';
import { GeoPoint } from '@shared/models/geographic';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { frecuencyUnit } from '@shared/models/frecuency';
import { HomeService } from '../../home.service';

@Component({
  selector: 'app-graphics',
  templateUrl: './graphics.page.html',
  styleUrls: ['./graphics.page.scss'],
})
export class GraphicsPage {

  anthenaOneHeight: number = 5;
  anthenaTwoHeight: number = 3;

  initialPoint: GeoPoint;
  finalPoint: GeoPoint;

  antennaSettingsObservable = this.settingsService
                                  .linkSettings$
                                  .subscribe((settings) => {

      this.anthenaOneHeight = settings.anthenaOneHigh;
      this.anthenaTwoHeight = settings.anthenaTwoHigh;

  });

  settingsForm: FormGroup;
  showForm: boolean = false;
  frecuency: number = 40;
  frecuencyUnit: frecuencyUnit = frecuencyUnit.GHZ;
  frecuenciesUnits: frecuencyUnit[] = [
    frecuencyUnit.HZ,
    frecuencyUnit.MHZ,
    frecuencyUnit.GHZ
  ];
  antennaInitialHeight: number = 0;
  antennaFinalHeight: number = 0;

  constructor( private settingsService: SettingsService,
               private router: Router,
               private formBuilder: FormBuilder,
               private homeService: HomeService ) {}

               showMap() {
                console.log("home service show map ", this.homeService.showMap)
               }

  ionViewDidEnter() {

    this.initialPoint = this.settingsService.initialPoint;
    this.finalPoint = this.settingsService.finalPoint;
    this.antennaInitialHeight = this.settingsService.antennaInitialHeight;
    this.antennaFinalHeight = this.settingsService.antennaFinalHeight;

    this.setSettingsForm();
    this.showForm = true;

  }

  getDestinationLatLong(lat1: number, lon1: number, bearing: number, distance: number): [number, number] {
    const R = 6371; // radio de la Tierra en km
    const d = distance / 1000; // distancia en km
    const lat1Rad = lat1 * Math.PI / 180; // latitud en radianes
    const lon1Rad = lon1 * Math.PI / 180; // longitud en radianes
    const bearingRad = bearing * Math.PI / 180; // dirección en radianes
  
    const lat2Rad = Math.asin(Math.sin(lat1Rad) * Math.cos(d/R) + Math.cos(lat1Rad) * Math.sin(d/R) * Math.cos(bearingRad));
    const lon2Rad = lon1Rad + Math.atan2(Math.sin(bearingRad) * Math.sin(d/R) * Math.cos(lat1Rad), Math.cos(d/R) - Math.sin(lat1Rad) * Math.sin(lat2Rad));
  
    const lat2 = lat2Rad * 180 / Math.PI; // latitud en grados
    const lon2 = lon2Rad * 180 / Math.PI; // longitud en grados
  
    return [lat2, lon2];
  }

  getBearingOriginal(lat1: number, 
              lon1: number, 
              lat2: number, 
              lon2: number): number {

    let lat1Radian = lat1 * (Math.PI)/180;
    let lat2Radian = lat2 * (Math.PI)/180;
    let lon1Radian = lon1 * (Math.PI)/180;
    let lon2Radian = lon2 * (Math.PI)/180;

    const y = Math.sin(lon2Radian-lon1Radian) * Math.cos(lat2Radian);
    const x = Math.cos(lat1Radian)*Math.sin(lat2Radian) -
              Math.sin(lat1Radian)*Math.cos(lat2Radian)*Math.cos(lon2Radian-lon1Radian);
    const θ = Math.atan2(y, x);
    const bearing = (θ*180/Math.PI + 360) % 360; // in degrees

    return bearing

  }

  getBearingRobot(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const lat1Rad = lat1 * Math.PI / 180; // latitud del punto A en radianes
    const lat2Rad = lat2 * Math.PI / 180; // latitud del punto B en radianes
    const dLon = (lon2 - lon1) * Math.PI / 180; // diferencia de longitud en radianes
  
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
    const bearingRad = Math.atan2(y, x); // bearing en radianes
    const bearingDeg = bearingRad * 180 / Math.PI; // bearing en grados
  
    return (bearingDeg + 360) % 360; // ajuste de la dirección a un rango de 0 a 360 grados
  }
  setSettingsForm() {

    this.settingsForm = this.formBuilder.group({
      initialLat: this.formBuilder.control(this.initialPoint.lat === 0 ? null : this.initialPoint.lat),
      initialLng: this.formBuilder.control(this.initialPoint.lng === 0 ? null : this.initialPoint.lng),
      finalLat: this.formBuilder.control(this.finalPoint.lat === 0 ? null : this.finalPoint.lat),
      finalLng: this.formBuilder.control(this.finalPoint.lng === 0 ? null : this.finalPoint.lng),
      frecuency: this.formBuilder.control(this.frecuency === 0 ? null : this.frecuency),
      frecuencyUnit: this.formBuilder.control(this.frecuencyUnit === frecuencyUnit.HZ ? null : this.frecuencyUnit),
      antennaInitialHeight: this.formBuilder.control(this.antennaInitialHeight === 0 ? null : this.antennaInitialHeight),
      antennaFinalHeight: this.formBuilder.control(this.antennaFinalHeight === 0 ? null : this.antennaFinalHeight)
    });

    console.log("this.settingsForm ", this.settingsForm)
  }

  navToProfileGraph() {
    this.router.navigate([`/home/graphics/elevation-profile`]);
  }

  navToAtenuationGraph() {
    this.router.navigate(['/home/graphics/atenuation-graph']);
  }

  navToAtenuationVaporGraph() {
    this.router.navigate(['/home/graphics/atenuation-water-vapor-graph']);
  }

}

