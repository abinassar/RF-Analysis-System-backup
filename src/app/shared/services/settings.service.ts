import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GeoPoint, defaultPoints } from '../models/geographic';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  linkSettings = new Subject<any>();
  linkSettings$ = this.linkSettings.asObservable();

  frecuency: number;
  initialPoint: GeoPoint = defaultPoints;
  finalPoint: GeoPoint = defaultPoints;
  antennaInitialHeight: number = 10;
  antennaFinalHeight: number = 15;

  constructor() { }
}
