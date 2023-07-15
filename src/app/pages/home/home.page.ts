import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { Router } from '@angular/router';
import { SettingsService } from '@shared/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  
  firstChargeTab: boolean = true;

  constructor(private homeService: HomeService,
              private router: Router,
              public settingsService: SettingsService) { }

  ngOnInit() {
  }

  onTabWillChange(event: any) {

    // setTimeout(() => {
    //   console.log('Cambiando de tab...');
    // }, 2000);

    // if (!this.firstChargeTab) { 
    //   console.log("deleting map")
    //   this.homeService.showMap = false;
    // } else {
    //   this.firstChargeTab = false;
    // }

    // setTimeout(() => {
    // }, 300);
    // // Cancelar el cambio de tab actual
    // event.preventDefault();

  }

  navMap() {

    this.navigateToTab(`/home/map`);

  }

  navigateToTab(path) {
    
    this.homeService.showMap = false;
    
    setTimeout(() => {

      this.router.navigate([path])
      
    }, 200);
  }

  navGraphics() {
    this.navigateToTab(`/home/graphics`);
  }

  navPower() {
    this.navigateToTab(`/home/power-budget`);
  }

}
