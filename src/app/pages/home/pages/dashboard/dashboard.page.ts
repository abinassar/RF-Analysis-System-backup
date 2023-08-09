import { Component, OnInit } from '@angular/core';
import { AlertService, SettingsService } from '@shared/services';
import { HomeService } from '../../home.service';
import { GeoPoint, LinkSettings } from '@shared/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.getUserLinks();
  }

  getUserLinks() {

    // this.alertService.showLoading("Obteniendo datos del enlace...");
    
    this.settingsService
        .getUserLinks("DSVlv21Tk8ZcPjwwvmrlzzMk2472")
        .then((response: any) => {

          console.log("repsonse ", response)

          const linksSettings: LinkSettings[] = response.linkSettings;

          this.alertService.closeLoading();

          this.settingsService.linkSettingsList = linksSettings;
          this.settingsService.linkSettings = linksSettings[0];
          this.setLinkForm();


          
        })
        .catch((error) => {
          
          this.alertService.closeLoading();

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
