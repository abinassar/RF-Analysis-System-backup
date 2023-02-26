import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AntennaListComponent } from '../antenna-list/antenna-list.component';

@Component({
  selector: 'app-link-configuration',
  templateUrl: './link-configuration.component.html',
  styleUrls: ['./link-configuration.component.scss'],
})
export class LinkConfigurationComponent {

  name: string;

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(this.name, 'confirm');
  }

  async openAntennasConfig() {
    const modal = await this.modalCtrl.create({
      component: AntennaListComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    // if (role === 'confirm') {
    //   this.message = `Hello, ${data}!`;
    // }
  }
}
