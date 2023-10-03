import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { AlertService, SettingsService } from '@shared/services';
import { LinkSettings, defaultLinkSettings } from '@shared/models';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  showMap: boolean = false;
  decodedToken: any;

  constructor(private alertService: AlertService,
              public settingsService: SettingsService) { }

  get getUserId(): string {
    let token = localStorage.getItem("token");

    const decodeToken: any = jwt_decode(token);

    return decodeToken.user_id;

  }

  getUserLinks() {

    this.alertService.showLoading("Obteniendo datos del enlace...");
    
    this.settingsService
        .getUserLinks(this.getUserId)
        .then((response: any) => {

          console.log("user links ", response)

          const linksSettings: LinkSettings[] = response.linkSettings;

          this.alertService.closeLoading();

          if (JSON.stringify(this.settingsService.linkSettings) === JSON.stringify(defaultLinkSettings)) {

            this.settingsService.linkSettingsList = linksSettings;
            
            let settingSelectedIndex = linksSettings.findIndex((linkSetting) => {
              return linkSetting.selected === true
            });
  
            console.log("linksSettings ", linksSettings)
            console.log("settingSelectedIndex ", settingSelectedIndex)
  
            this.settingsService.linkSettings = linksSettings[settingSelectedIndex];

          }


        })
        .catch((error) => {
          
          this.settingsService.linkSettings = defaultLinkSettings;
          this.alertService.closeLoading();

        });

  }

}
