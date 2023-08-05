import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Antenna, antennasList } from '@shared/models';

@Component({
  selector: 'app-antenna-list',
  templateUrl: './antenna-list.component.html',
  styleUrls: ['./antenna-list.component.scss'],
})
export class AntennaListComponent implements OnInit {

  antennaSelectedIndex: number = 0;

  antennaList: Antenna[] = antennasList;

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

    return this.modalCtrl.dismiss(this.antennaList[this.antennaSelectedIndex]);
  }

  changedAntenna($event, index) {    
    this.antennaSelected.at(this.antennaSelectedIndex).get("checked").setValue(false);
    this.antennaSelectedIndex = index;
  }

}
