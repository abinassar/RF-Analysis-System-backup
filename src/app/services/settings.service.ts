import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  linkSettings = new Subject<any>();
  linkSettings$ = this.linkSettings.asObservable();

  initialPoint = new Subject<any>();
  initialPoint$ = this.initialPoint.asObservable();

  finalPoint = new Subject<any>();
  finalPoint$ = this.finalPoint.asObservable();

  constructor() { }
}
