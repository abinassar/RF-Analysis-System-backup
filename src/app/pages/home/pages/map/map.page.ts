import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../home.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SettingsService } from '@shared/services';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  constructor(public homeService: HomeService,
              private router: Router,
              private navCtrl: NavController,
              private settingsService: SettingsService) {

  }

  ngOnInit() {
    this.homeService.showMap = true;
  }

  ionViewWillEnter() {
    this.settingsService.showTabs = false;
  }
  
  showMap() {
    this.homeService.showMap = true;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.homeService.showMap = false;
  }

  navigateToBackPage() {
    this.homeService.showMap = false;
    setTimeout(() => {
      this.navCtrl.back();
    }, 100);
  }

}

