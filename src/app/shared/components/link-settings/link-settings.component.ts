import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { LinkSettings, defaultLinkSettings } from '@shared/models';
import { AlertService, SettingsService } from '@shared/services';
import { HomeService } from 'src/app/pages/home/home.service';

@Component({
  selector: 'app-link-settings',
  templateUrl: './link-settings.component.html',
  styleUrls: ['./link-settings.component.scss'],
})
export class LinkSettingsComponent  implements OnInit {

  linkSettings: LinkSettings;
  linkSettingsList: LinkSettings[];
  linkSettingsForm: FormGroup;
  linksArray: FormArray;
  linkSelectedIndex: number = 0;

  // create link variables

  linkForm: FormGroup;
  createLink: boolean = false;

  constructor(private navParams: NavParams,
              private formBuilder: FormBuilder,
              private modalCtrl: ModalController,
              private settingsService: SettingsService,
              private homeService: HomeService,
              private alertService: AlertService) { }

  ngOnInit() {
    this.linkSettings = this.navParams.get('linkSettings');
    this.linkSettingsList = this.navParams.get('linkSettingsList');
    console.log("this.linkSettings ", this.linkSettings);
    console.log("this.linkSettingsList ", this.linkSettingsList);

    this.linkSettingsForm = this.formBuilder.group({
      linkSelected: this.formBuilder.array([])
    });

    this.linksArray = this.linkSettingsForm
                            .get('linkSelected') as FormArray;

    this.linkSettingsList.forEach((link) => {
      const linkGroup = this.formBuilder.group({
        checked: [link.selected]
      });

      this.linksArray.push(linkGroup);
    });
      
    let linkSelectedIndex = this.linkSettingsList.findIndex((link) => {
      return link.linkName === this.linkSettings.linkName
    });

    console.log("linkSelectedIndex ", linkSelectedIndex)

    if (linkSelectedIndex !== -1) {

      this.linksArray.at(linkSelectedIndex).get("checked").setValue(true);
      this.linkSelectedIndex = linkSelectedIndex;

    } else {

      this.linksArray.at(0).get("checked").setValue(true);
      this.linkSelectedIndex = 0;

    }

    console.log("this.linksArray ", this.linksArray)

  }

  setLinkForm() {
    this.linkForm = this.formBuilder.group({
      linkName: this.formBuilder.control('', Validators.required)
    });
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {

    this.alertService.showLoading("Guardando configuración de enlaces...");
  
    this.settingsService
        .SetUserLinkSettingsData(this.homeService.getUserId, this.linkSettingsList)
        .subscribe((response) => {

          this.alertService.closeLoading();
          return this.modalCtrl.dismiss(this.linkSettingsList[this.linkSelectedIndex]);

        },
        (error) => {
          this.alertService.closeLoading();
          this.alertService.presentAlert("Hubo un problema guardando la configuracion",
                                         "Por favor, intenta mas tarde")
        });

  }

  deleteLink(index) {

    this.alertService.showConfirmationAlert("¿Eliminar enlace?", 
                                            `¿Estás seguro de eliminar el enlace '${this.linkSettingsList[index].linkName}'?`)
                     .then((confirm) => {
                      console.log("confirm ", confirm)

                        if (confirm) {
                          this.linksArray.removeAt(index);
                          this.linkSettingsList.splice(index, 1);
                        }

                     })

    console.log("link list", this.linkSettingsList)
  }

  changedLink($event, index) {

    if (index !== this.linkSelectedIndex) {
      this.linksArray.at(this.linkSelectedIndex).get("checked").setValue(false);
      this.linkSettingsList[this.linkSelectedIndex].selected = false;
      this.linkSelectedIndex = index;
      this.linksArray.at(this.linkSelectedIndex).get("checked").setValue(true);
      this.linkSettingsList[this.linkSelectedIndex].selected = true;
    }

  }

  newLink() {

    this.setLinkForm();
    this.createLink = true;
    
  }

  createLinkSettings() {

    if (this.linkForm.valid) {
      
      let newLinkSettings: LinkSettings = {...defaultLinkSettings};
      const linksList = this.linkSettingsList.slice();

      newLinkSettings.linkName = this.linkForm.get("linkName").value;
      newLinkSettings.selected = false;

      console.log("newLinkSettings ", newLinkSettings)
  
      linksList.push(newLinkSettings);

      console.log("linksList ", linksList)

      const linkGroup = this.formBuilder.group({
        checked: false
      });

      this.linksArray.push(linkGroup);

      this.linkSettingsList.push(newLinkSettings);

    }
  }

}
