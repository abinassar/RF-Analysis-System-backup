import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../home.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  constructor(public homeService: HomeService) {

  }

  ngOnInit() {
    this.homeService.showMap = true;
  }

  hideMap() {
    this.homeService.showMap = false;
  }

  showMap() {
    this.homeService.showMap = true;
    console.log("this.homeService.showMap ", this.homeService.showMap)
  }

}

