import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ElevationData, LocationWeather } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  uri: string = 'http://127.0.0.1:5000';
  // uri: string = 'http://abinassar.pythonanywhere.com';

  constructor(private dataService: DataService) { }

  getElevationProfile(startPoint, endPoint): Observable<ElevationData> {
    console.log("startPoint ", startPoint)
    console.log("endPoint ", endPoint)
    return this.dataService.post(this.uri + "/elevation_profile", {
      "start_point": startPoint,
      "end_point": endPoint
    })
  }

  getWaterVaporAtenuation(pressure: number, 
                          temperature: number,
                          waterDensity: number) {
    return this.dataService.post(this.uri + "/get_atmospheric_atenuation_water_vapor", {
      pressure,
      temperature,
      waterDensity
    })
  }

  getSpecificWaterVaporAtenuation(pressure: number, 
                                  temperature: number,
                                  waterDensity: number,
                                  frecuency: number) {
    return this.dataService.post(this.uri + "/get_specific_atmospheric_atenuation_water_vapor", {
      pressure,
      temperature,
      waterDensity,
      frecuency
    })
  }

  getAtenuation(pressure: number, temperature: number) {
    return this.dataService.post(this.uri + "/get_atmospheric_atenuation", {
      pressure,
      temperature
    })
  }

  getSpecificAtenuation(pressure: number, 
                        temperature: number, 
                        frecuency: number) {
    return this.dataService.post(this.uri + "/get_specific_atmospheric_atenuation", {
      pressure,
      temperature,
      frecuency
    })
  }

  getLocationData(lat: string, lng: string): Observable<LocationWeather> {
    return this.dataService.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&lang=es&appid=${environment.weatherAPIKey}`);
  }
}
