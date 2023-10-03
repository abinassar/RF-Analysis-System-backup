import { Component, OnInit } from '@angular/core';
import { AlertService, SettingsService } from '@shared/services';
import { HomeService } from '../../home.service';
import { GeoPoint, LinkSettings, defaultLinkSettings } from '@shared/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignInService } from 'src/app/pages/sign-in/sign-in.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  linksForm: FormGroup;
  showLinkForm: boolean = false;

  constructor(public settingsService: SettingsService,
              private alertService: AlertService,
              public homeService: HomeService,
              private formBuilder: FormBuilder,
              private router: Router,
              private signInService: SignInService) { }

  async ngOnInit() {
    await this.homeService.getUserLinks();

    this.settingsService
        .getUserLinks(this.homeService.getUserId)
        .then((response: any) => {

          const linksSettings: LinkSettings[] = response.linkSettings;

          this.alertService.closeLoading();

          this.settingsService.linkSettingsList = linksSettings;

          let settingSelectedIndex = linksSettings.findIndex((linkSetting) => {
            return linkSetting.selected === true
          });

          this.settingsService.linkSettings = linksSettings[settingSelectedIndex];
          this.setLinkForm();

        })
        .catch((error) => {
          
          this.settingsService.linkSettings = defaultLinkSettings;
          this.alertService.closeLoading();
          this.setLinkForm();

        });

  }

  onSelectionChange(event: any) {
    let linkSelectedIndex = this.settingsService.linkSettingsList.findIndex((link) => {
      return link.linkName === event.detail.value
    });

    this.settingsService.linkSettings = this.settingsService.linkSettingsList[linkSelectedIndex];
  }

  navToProfileGraph() {
    setTimeout(() => {      
      this.router.navigate([`/home/graphics/elevation-profile`]);
    }, 100);
  }

  navToAtenuationGraph() {

    setTimeout(() => {
      this.router.navigate(['/home/graphics/atenuation-graph']);
    }, 100);

  }

  navToAtenuationVaporGraph() {

    setTimeout(() => {      
      this.router.navigate(['/home/graphics/atenuation-water-vapor-graph']);
    }, 100);

  }

  navigateToSign() {

    let randomSecond = Math.random();
    localStorage.removeItem("token");

    setTimeout(() => {
      this.alertService.closeLoading();
      this.router.navigate(['/sign-in']);
    }, randomSecond);

  }

  signOut() {

    this.alertService.showLoading("Cerrando sesión");

    this.signInService
        .SignOut()
        .then((response) => {
          this.navigateToSign();
        })
        .catch((error) => {
          this.navigateToSign();
        });
  }

  setLinkForm() {
    this.linksForm = this.formBuilder.group({
      linkSelected: this.formBuilder.control(this.settingsService.linkSettings.linkName !== null ? 
                                              this.settingsService.linkSettings.linkName : null, Validators.required)
    });
    this.showLinkForm = true;
  }

}
