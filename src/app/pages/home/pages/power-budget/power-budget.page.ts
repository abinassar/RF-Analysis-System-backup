import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

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

  constructor(private deviceOrientation: DeviceOrientation,
              private geolocation: Geolocation,
              private formBuilder: FormBuilder) {

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

  ionViewDidEnter() {
    this.setAntennaForm();
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
      txPower: this.formBuilder.control(0),
      txAntennaGain: this.formBuilder.control(0),
      txLoss: this.formBuilder.control(0),
      freeSpaceLoss: this.formBuilder.control(0),
      miscLoss: this.formBuilder.control(0),
      rxAntennaGain: this.formBuilder.control(0),
      rxLoss: this.formBuilder.control(0)
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

