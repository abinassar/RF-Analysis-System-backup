import { Component, OnDestroy } from '@angular/core';
import { SettingsService } from '@shared/services/settings.service';
import { GeoPoint } from '@shared/models/geographic';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { frecuencyUnit } from '@shared/models/frecuency';
import { HomeService } from '../../home.service';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { AlertService, DataService } from '@shared/services';
import { AntennaSelected, LinkSettings } from '@shared/models';

@Component({
  selector: 'app-graphics',
  templateUrl: './graphics.page.html',
  styleUrls: ['./graphics.page.scss'],
})
export class GraphicsPage implements OnDestroy {

  anthenaOneHeight: number = 5;
  anthenaTwoHeight: number = 3;

  initialPoint: GeoPoint;
  finalPoint: GeoPoint;

  antennaSettingsObservable = this.settingsService
                                  .setLinkSettings$
                                  .subscribe((settings) => {

      this.anthenaOneHeight = settings.anthenaOneHigh;
      this.anthenaTwoHeight = settings.anthenaTwoHigh;

  });

  updateGeoPointsObservable = this.settingsService
                                  .updateGeoPoints$
                                  .subscribe(() => {
                                    console.log("set geopoints")

                                    this.settingsForm.get("initialLat").setValue(this.settingsService.linkSettings.P1.lat);
                                    this.settingsForm.get("initialLng").setValue(this.settingsService.linkSettings.P1.lng);
                                    this.settingsForm.get("finalLat").setValue(this.settingsService.linkSettings.P2.lat);
                                    this.settingsForm.get("finalLng").setValue(this.settingsService.linkSettings.P2.lng);
                                  
                                  });

  settingsForm: FormGroup;
  showForm: boolean = false;
  frecuencyUnit: frecuencyUnit = frecuencyUnit.GHZ;
  frecuenciesUnits: frecuencyUnit[] = [
    frecuencyUnit.HZ,
    frecuencyUnit.MHZ,
    frecuencyUnit.GHZ
  ];
  showMap: boolean = true;
  P1: GeoPoint;
  P2: GeoPoint;

  constructor( public settingsService: SettingsService,
               private router: Router,
               private formBuilder: FormBuilder,
               private homeService: HomeService,
               private screenOrientation: ScreenOrientation,
               private alertService: AlertService ) {}

  ionViewDidEnter() {

    this.alertService.showLoading("Obteniendo datos de enlace");

    this.getUserLinks();

    this.showMap = true;

  }

  saveLinkSettings() {

    if (this.settingsForm.valid) {
      
      this.alertService.showLoading("Guardando datos del enlace...");

      const antennaSelected: AntennaSelected = {...this.settingsService.linkSettings.antennaSelected}

      antennaSelected.frecuency = this.settingsForm.get("frecuency").value;
      
      const linkSettings: LinkSettings = {
        P1: {
          lat: this.settingsForm.get("initialLat").value,
          lng: this.settingsForm.get("initialLng").value
        },
        P2: {
          lat: this.settingsForm.get("finalLat").value,
          lng: this.settingsForm.get("finalLng").value
        },
        antennaOneHeight: this.settingsForm.get("antennaInitialHeight").value,
        antennaTwoHeight: this.settingsForm.get("antennaFinalHeight").value,
        antennaSelected: antennaSelected,
        atmosphericPressure: this.settingsService.linkSettings.atmosphericPressure,
        temperature: this.settingsService.linkSettings.temperature,
        waterDensity: this.settingsService.linkSettings.waterDensity,
        linkName: this.settingsService.linkSettings.linkName
      }

      this.settingsService
          .SetUserLinkSettingsData("DSVlv21Tk8ZcPjwwvmrlzzMk2472", [linkSettings])
          .subscribe((response) => {

            this.alertService.closeLoading();

          },
          (error) => {
            this.alertService.closeLoading();
            this.alertService.presentAlert("Hubo un problema guadrando la configuracion",
                                           "Por favor, intenta mas tarde")
          });

    } else {

      this.settingsForm.markAllAsTouched();
      this.alertService
          .presentAlert("Salvar configuración", 
                        "Por favor completa los datos para poder guardar los datos del enlace");

    }

  }
  
  getUserLinks() {

    // this.alertService.showLoading("Obteniendo datos del enlace...");
    
    this.settingsService
        .getUserLinks("DSVlv21Tk8ZcPjwwvmrlzzMk2472")
        .then((response: any) => {

          console.log("repsonse ", response)

          const linksSettings: LinkSettings[] = response.linkSettings;

          this.alertService.closeLoading();
          
          this.settingsService.linkSettings = linksSettings[0];

          this.P1 = {...linksSettings[0].P1};
          this.P2 = {...linksSettings[0].P2};
          
          this.setSettingsForm();
          this.showForm = true;
          

        })
        .catch((error) => {
          
          this.alertService.closeLoading();
          this.setSettingsForm();
          this.showForm = true;

        });

  }

  changeSelectedLink() {

  }
  
  showFullScreenMap() {
    this.showMap = false;
    setTimeout(() => {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
      this.router.navigate([`/home/map`]);
    }, 100);
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
      initialLat: this.formBuilder.control(this.settingsService.linkSettings.P1.lat === 0 ? null : this.settingsService.linkSettings.P1.lat, Validators.required),
      initialLng: this.formBuilder.control(this.settingsService.linkSettings.P1.lng === 0 ? null : this.settingsService.linkSettings.P1.lng, Validators.required),
      finalLat: this.formBuilder.control(this.settingsService.linkSettings.P2.lat === 0 ? null : this.settingsService.linkSettings.P2.lat, Validators.required),
      finalLng: this.formBuilder.control(this.settingsService.linkSettings.P2.lng === 0 ? null : this.settingsService.linkSettings.P2.lng, Validators.required),
      frecuency: this.formBuilder.control(this.settingsService.linkSettings.antennaSelected.frecuency === 0 ? null : this.settingsService.linkSettings.antennaSelected.frecuency, Validators.required),
      frecuencyUnit: this.formBuilder.control(this.frecuencyUnit === frecuencyUnit.HZ ? null : this.frecuencyUnit, Validators.required),
      antennaInitialHeight: this.formBuilder.control(this.settingsService.linkSettings.antennaOneHeight === 0 ? null : this.settingsService.linkSettings.antennaOneHeight, Validators.required),
      antennaFinalHeight: this.formBuilder.control(this.settingsService.linkSettings.antennaTwoHeight === 0 ? null : this.settingsService.linkSettings.antennaTwoHeight, Validators.required)
    });

  }

  navToProfileGraph() {
    this.showMap = false;
    setTimeout(() => {      
      this.router.navigate([`/home/graphics/elevation-profile`]);
    }, 100);
  }

  navToAtenuationGraph() {

    this.showMap = false;

    setTimeout(() => {
      this.router.navigate(['/home/graphics/atenuation-graph']);
    }, 100);

  }

  navToAtenuationVaporGraph() {

    this.showMap = false;

    setTimeout(() => {      
      this.router.navigate(['/home/graphics/atenuation-water-vapor-graph']);
    }, 100);

  }

  ngOnDestroy(): void {
      this.antennaSettingsObservable.unsubscribe();
      this.updateGeoPointsObservable.unsubscribe();
  }

}

