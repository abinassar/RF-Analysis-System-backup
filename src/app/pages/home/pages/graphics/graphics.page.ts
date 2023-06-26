import { Component } from '@angular/core';
import { SettingsService } from '@shared/services/settings.service';
import { GeoPoint } from '@shared/models/geographic';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { frecuencyUnit } from '@shared/models/frecuency';

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
  frecuencies: frecuencyUnit[] = [
    frecuencyUnit.HZ,
    frecuencyUnit.MHZ,
    frecuencyUnit.GHZ
  ];
  antennaInitialHeight: number = 0;
  antennaFinalHeight: number = 0;

  constructor( private settingsService: SettingsService,
               private router: Router,
               private formBuilder: FormBuilder ) {}

  ionViewDidEnter() {

    this.initialPoint = this.settingsService.initialPoint;
    this.finalPoint = this.settingsService.finalPoint;
    this.antennaInitialHeight = this.settingsService.antennaInitialHeight;
    this.antennaFinalHeight = this.settingsService.antennaFinalHeight;

    this.setSettingsForm();
    this.showForm = true;

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

