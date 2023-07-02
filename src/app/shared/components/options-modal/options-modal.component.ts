import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-options-modal',
  templateUrl: './options-modal.component.html',
  styleUrls: ['./options-modal.component.scss'],
})
export class OptionsModalComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  async onOption1Click() {
    await this.modalCtrl.dismiss('option1');
  }

  async onOption2Click() {
    await this.modalCtrl.dismiss('option2');
  }

}
