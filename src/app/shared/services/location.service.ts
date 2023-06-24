import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { LocationWeather } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private dataService: DataService) { }

  getElevationProfile(startPoint, endPoint) {
    console.log("startPoint ", startPoint)
    console.log("endPoint ", endPoint)
    return this.dataService.post("http://127.0.0.1:5000/elevation_profile", {
      "start_point": startPoint,
      "end_point": endPoint
    })
  }

  getWaterVaporAtenuation(pressure: number, 
                          temperature: number,
                          waterDensity: number) {
    return this.dataService.post("http://127.0.0.1:5000/get_atmospheric_atenuation_water_vapor", {
      pressure,
      temperature,
      waterDensity
    })
  }

  getAtenuation(pressure: number, temperature: number) {
    return this.dataService.post("http://127.0.0.1:5000/get_atmospheric_atenuation", {
      pressure,
      temperature
    })
  }

  getLocationData(lat: string, lng: string): Observable<LocationWeather> {
    return this.dataService.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${environment.weatherAPIKey}`);
  }
}
