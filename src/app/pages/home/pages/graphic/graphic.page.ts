import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SettingsService } from '@shared/services';

@Component({
  selector: 'app-graphic',
  templateUrl: './graphic.page.html',
  styleUrls: ['./graphic.page.scss'],
})
export class GraphicPage implements OnInit {

  data: any;
  layout: any;

  constructor(private navCtrl: NavController,
              private settingsService: SettingsService) { }

  ngOnInit() {

    this.data = JSON.parse(localStorage.getItem("graphic-data"));
    this.layout = JSON.parse(localStorage.getItem("graphic-layout"));

  }

  ionViewWillEnter() {
    this.settingsService.showTabs = false;
  }

  navigateToBackPage() {
    this.navCtrl.back();
  }

}
