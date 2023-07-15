import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GeoPoint, defaultPoints } from '../models/geographic';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // Link settings

  linkSettings = new Subject<any>();
  linkSettings$ = this.linkSettings.asObservable();
  frecuency: number;
  linkDistance: number = 0;

  // Atomospheric atributes

  atmosphericPressure: number = 0;
  temperature: number = 0;
  waterDensity: number = 0;
  locationName: string = "";

  // Geographic settings

  initialPoint: GeoPoint = defaultPoints;
  finalPoint: GeoPoint = defaultPoints;
  antennaInitialHeight: number = 10;
  antennaFinalHeight: number = 15;
  showTabs: boolean = true;

  constructor() { }
}
