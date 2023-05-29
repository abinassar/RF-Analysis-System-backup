import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private dataService: DataService) { }

  getElevationProfile(startPoint, endPoint) {
    return this.dataService.post("http://127.0.0.1:5000/elevation_profile", {
      "start_point": startPoint,
      "end_point": endPoint
    })
  }
}
