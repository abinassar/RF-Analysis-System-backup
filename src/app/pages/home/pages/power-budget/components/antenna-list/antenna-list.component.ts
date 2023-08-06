import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Antenna, LinkSettings, antennasList } from '@shared/models';
import { AlertService, SettingsService } from '@shared/services';

@Component({
  selector: 'app-antenna-list',
  templateUrl: './antenna-list.component.html',
  styleUrls: ['./antenna-list.component.scss'],
})
export class AntennaListComponent implements OnInit {

  @Input() antennaSelectedName: string;

  antennaSelectedIndex: number = 0;
  antennasList: Antenna[] = antennasList;
  antennaSettingsForm: FormGroup;
  antennaSelected: FormArray;
  antennaName: string;

  constructor(private modalCtrl: ModalController,
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              private settingsService: SettingsService,
              private navParams: NavParams) { }

  ngOnInit() {

    this.antennaName = this.navParams.get('antennaName');
    console.log("this.antennaName ", this.antennaName)
    this.antennaSettingsForm = this.formBuilder.group({
      antennaSelected: this.formBuilder.array([])
    })

    this.antennaSelected = this.antennaSettingsForm
                               .get('antennaSelected') as FormArray;

    this.antennasList.forEach((antenna) => {
      const antennaGroup = this.formBuilder.group({
        checked: [antenna.checked]
      });

      this.antennaSelected.push(antennaGroup);
    });
      
    let antennaSelectedIndex = this.antennasList.findIndex((antenna) => {
      return antenna.name === this.antennaName
    });

    if (antennaSelectedIndex !== -1) {

      this.antennaSelected.at(antennaSelectedIndex).get("checked").setValue(true);
      this.antennaSelectedIndex = antennaSelectedIndex;

    } else {

      this.antennaSelected.at(0).get("checked").setValue(true);
      this.antennaSelectedIndex = 0;

    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {

    this.alertService.showLoading("Guardando datos del enlace...");

    let antennaSelected: Antenna = this.antennasList[this.antennaSelectedIndex];
    let antennaSelectedToSave = this.settingsService.linkSettings.antennaSelected;

    antennaSelectedToSave.name = this.antennasList[this.antennaSelectedIndex].name;

    const linkSettings: LinkSettings = {
      P1: this.settingsService.linkSettings.P1,
      P2: this.settingsService.linkSettings.P2,
      antennaOneHeight: this.settingsService.linkSettings.antennaOneHeight,
      antennaTwoHeight: this.settingsService.linkSettings.antennaTwoHeight,
      antennaSelected: antennaSelectedToSave,
      atmosphericPressure: this.settingsService.linkSettings.atmosphericPressure,
      temperature: this.settingsService.linkSettings.temperature,
      waterDensity: this.settingsService.linkSettings.waterDensity,
      linkName: this.settingsService.linkSettings.linkName
    }

    this.settingsService
        .SetUserLinkSettingsData("DSVlv21Tk8ZcPjwwvmrlzzMk2472", [linkSettings])
        .subscribe((response) => {

          this.alertService.closeLoading();
          return this.modalCtrl.dismiss(antennaSelected);

        },
        (error) => {
          this.alertService.closeLoading();
          this.alertService.presentAlert("Hubo un problema guadrando la configuracion",
                                         "Por favor, intenta mas tarde")
                           .then(() => {
                            return this.modalCtrl.dismiss();
                           })
        });

  }

  changedAntenna($event, index) {    
    this.antennaSelected.at(this.antennaSelectedIndex).get("checked").setValue(false);
    this.antennaSelectedIndex = index;
  }

}
