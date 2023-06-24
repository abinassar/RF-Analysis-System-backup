import { Component } from '@angular/core';
import { SettingsService } from '@shared/services/settings.service';
import { GeoPoint } from '@shared/models/geographic';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  constructor( private settingsService: SettingsService,
               private router: Router,
               private formBuilder: FormBuilder ) {}

  ionViewDidEnter() {

    this.initialPoint = this.settingsService.initialPoint;
    this.finalPoint = this.settingsService.finalPoint;

    this.setSettingsForm();
    this.showForm = true;

  }

  setSettingsForm() {

    this.settingsForm = this.formBuilder.group({
      initialLat: this.formBuilder.control(this.initialPoint.lat === 0 ? null : this.initialPoint.lat),
      initialLng: this.formBuilder.control(this.initialPoint.lng === 0 ? null : this.initialPoint.lng),
      finalLat: this.formBuilder.control(this.finalPoint.lat === 0 ? null : this.finalPoint.lat),
      finalLng: this.formBuilder.control(this.finalPoint.lng === 0 ? null : this.finalPoint.lng),
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

