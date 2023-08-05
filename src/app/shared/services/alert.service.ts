import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private alertController: AlertController,
              private loadingCtrl: LoadingController) { }

  async presentAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: title,
      subHeader: "",
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  closeLoading() {
    this.loadingCtrl.dismiss();
  }

  async showLoading(message: string) {
    const loading = await this.loadingCtrl.create({
      message
    });

    loading.present();
  }
}
