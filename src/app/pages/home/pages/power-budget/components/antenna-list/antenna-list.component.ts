import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Antenna } from '@shared/models';

@Component({
  selector: 'app-antenna-list',
  templateUrl: './antenna-list.component.html',
  styleUrls: ['./antenna-list.component.scss'],
})
export class AntennaListComponent implements OnInit {

  antennaSelectedIndex: number = 0;

  antennaList: Antenna[] = [
    {
      name: "AIRMAX U-OMT-DISH-5 1",
      imgPath: "https://www.crsl.es/9909-large_default/ubiquiti-airmax-u-omt-dish-5-antena-dish-de-5ghz-de-27dbi-con-soporte.jpg",
      efficiency: 27,
      frecuency: 5,
      wavelength: 5,
      gain: 5,
      checked: true
    },
    {
      name: "AIRMAX U-OMT-DISH-5 2",
      imgPath: "https://www.crsl.es/9909-large_default/ubiquiti-airmax-u-omt-dish-5-antena-dish-de-5ghz-de-27dbi-con-soporte.jpg",
      efficiency: 27,
      frecuency: 5,
      wavelength: 5,
      gain: 5,
      checked: false
    }
  ];

  antennaSettingsForm: FormGroup;

  antennaSelected: FormArray;

  constructor(private modalCtrl: ModalController,
              private formBuilder: FormBuilder) { }

  ngOnInit() {

    this.antennaSettingsForm = this.formBuilder.group({
      antennaSelected: this.formBuilder.array([])
    })

    this.antennaSelected = this.antennaSettingsForm
                               .get('antennaSelected') as FormArray;

    this.antennaList.forEach((antenna) => {
      const antennaGroup = this.formBuilder.group({
        checked: [antenna.checked]
      });

      this.antennaSelected.push(antennaGroup);
    })

  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {

    console.log("Antena seleccionada = ", this.antennaList[this.antennaSelectedIndex]);

    return this.modalCtrl.dismiss();
  }

  changedAntenna($event, index) {    
    this.antennaSelected.at(this.antennaSelectedIndex).get("checked").setValue(false);
    this.antennaSelectedIndex = index;
  }

}
