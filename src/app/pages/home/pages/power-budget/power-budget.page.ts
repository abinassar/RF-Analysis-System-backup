import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { ModalController } from '@ionic/angular';
import { AntennaListComponent } from './components/antenna-list/antenna-list.component';
import { AlertService, SettingsService } from '@shared/services';
import { Antenna, AntennaSelected, LinkSettings, antennasList } from '@shared/models';
import { HomeService } from '../../home.service';

@Component({
  selector: 'app-power-budget',
  templateUrl: './power-budget.page.html',
  styleUrls: ['./power-budget.page.scss'],
})
export class PowerBudgetPage {

  // We will call this variable on home.page.html file
  data: DeviceOrientationCompassHeading;
  public currentLocation: any = null;

  // Initial Kaaba location that we've got from google maps
  private kaabaLocation: {lat:number,lng:number} = {lat: 21.42276, lng: 39.8256687};

  // Initial Qibla Location
  public qiblaLocation = 0;

  antennaForm: FormGroup;
  showForm: boolean = false;
  antennaSelected: Antenna = {
    name: "No Seleccionada",
    txAntennaGain: 0,
    frecuency: 0,
    maxDistanceKm: "",
    imgPath: "https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y",
    checked: false
  };
  antennasList: Antenna[] = antennasList;

  constructor(private deviceOrientation: DeviceOrientation,
              private geolocation: Geolocation,
              private formBuilder: FormBuilder,
              public modalController: ModalController,
              private settingsService: SettingsService,
              private alertService: AlertService,
              private homeService: HomeService) {

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

  async ionViewDidEnter() {

    await this.homeService.getUserLinks();
    let antennaSelectedIndex = this.antennasList.findIndex((antenna) => {
      return antenna.name === this.settingsService.linkSettings.antennaSelected.name
    });

    if (antennaSelectedIndex !== -1) {

      this.antennaSelected.imgPath = this.antennasList[antennaSelectedIndex].imgPath;
      this.antennaSelected.name = this.antennasList[antennaSelectedIndex].name;

    }
    
    this.setAntennaForm();

  }

  async navToAntennaList() {

    const modal = await this.modalController.create({
      component: AntennaListComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        antennaName: this.antennaSelected.name
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role !== 'cancel') {
        this.antennaSelected.imgPath = result.data.imgPath;
        this.antennaSelected.name = result.data.name;
      }
    });

    await modal.present();

  }

  saveLinkSettings() {
    
    if (this.antennaForm.valid) {
      
      this.alertService.showLoading("Guardando datos del enlace...");

      let antennaSettings = {...this.settingsService.linkSettings.antennaSelected};
      antennaSettings.txPower = this.antennaForm.get("txPower").value;
      antennaSettings.txAntennaGain = this.antennaForm.get("txAntennaGain").value;
      antennaSettings.txLoss = this.antennaForm.get("txLoss").value;
      antennaSettings.freeSpaceLoss = this.antennaForm.get("freeSpaceLoss").value;
      antennaSettings.miscLoss = this.antennaForm.get("miscLoss").value;
      antennaSettings.rxAntennaGain = this.antennaForm.get("rxAntennaGain").value;
      antennaSettings.rxLoss = this.antennaForm.get("rxLoss").value;

      const linkSettings: LinkSettings = {
        P1: this.settingsService.linkSettings.P1,
        P2: this.settingsService.linkSettings.P2,
        antennaOneHeight: this.settingsService.linkSettings.antennaOneHeight,
        antennaTwoHeight: this.settingsService.linkSettings.antennaTwoHeight,
        antennaSelected: antennaSettings,
        atmosphericPressure: this.settingsService.linkSettings.atmosphericPressure,
        temperature: this.settingsService.linkSettings.temperature,
        waterDensity: this.settingsService.linkSettings.waterDensity,
        linkName: this.settingsService.linkSettings.linkName,
        selected: true
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

      this.antennaForm.markAllAsTouched();
      this.alertService
          .presentAlert("Salvar configuración", 
                        "Por favor completa los datos para poder guardar los datos del enlace");

    }

  }

  powerAddition(): number {
    return this.antennaForm.get("txPower").value +
           this.antennaForm.get("txAntennaGain").value +
           this.antennaForm.get("txLoss").value +
           this.antennaForm.get("freeSpaceLoss").value +
           this.antennaForm.get("miscLoss").value +
           this.antennaForm.get("rxAntennaGain").value +
           this.antennaForm.get("rxLoss").value;
  }

  setAntennaForm() {

    this.antennaForm = this.formBuilder.group({
      txPower: this.formBuilder.control(this.settingsService.linkSettings.antennaSelected.txPower === 0 ? null : this.settingsService.linkSettings.antennaSelected.txPower, Validators.required),
      txAntennaGain: this.formBuilder.control(this.settingsService.linkSettings.antennaSelected.txAntennaGain === 0 ? null : this.settingsService.linkSettings.antennaSelected.txAntennaGain, Validators.required),
      txLoss: this.formBuilder.control(this.settingsService.linkSettings.antennaSelected.txLoss === 0 ? null : this.settingsService.linkSettings.antennaSelected.txLoss, Validators.required),
      freeSpaceLoss: this.formBuilder.control(this.settingsService.linkSettings.antennaSelected.freeSpaceLoss === 0 ? null : this.settingsService.linkSettings.antennaSelected.freeSpaceLoss, Validators.required),
      miscLoss: this.formBuilder.control(this.settingsService.linkSettings.antennaSelected.miscLoss === 0 ? null : this.settingsService.linkSettings.antennaSelected.miscLoss, Validators.required),
      rxAntennaGain: this.formBuilder.control(this.settingsService.linkSettings.antennaSelected.rxAntennaGain === 0 ? null : this.settingsService.linkSettings.antennaSelected.rxAntennaGain, Validators.required),
      rxLoss: this.formBuilder.control(this.settingsService.linkSettings.antennaSelected.rxLoss === 0 ? null : this.settingsService.linkSettings.antennaSelected.rxLoss, Validators.required)
    });

    this.showForm = true;

  }

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

