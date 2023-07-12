import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { defaultPoints, frecuencyUnit } from '@shared/models';
import { AlertService, LocationService, SettingsService } from '@shared/services';
import { HomeService } from 'src/app/pages/home/home.service';

@Component({
  selector: 'app-atenuation-graph',
  templateUrl: './atenuation-graph.component.html',
  styleUrls: ['./atenuation-graph.component.scss'],
})
export class AtenuationGraphComponent implements OnInit {

  atenuationData: any;
  atenuationDataX: number[] = [];
  atenuationDataY: number[] = [];
  atenuationGraph: boolean = false;
  elevationData: any;
  showMap: boolean = false;
  frecuenciesUnits: frecuencyUnit[] = [
    frecuencyUnit.HZ,
    frecuencyUnit.MHZ,
    frecuencyUnit.GHZ
  ];
  atenuationForm: FormGroup;
  showForm: boolean = false;
  atenuationByFrecuency: number = 0;

  constructor(private locationService: LocationService,
              private loadingCtrl: LoadingController,
              public homeService: HomeService,
              private settingsSetting: SettingsService,
              private alertService: AlertService,
              public settingsService: SettingsService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {

    this.homeService.showMap = true;

    this.getLocationData();

  }

  ionViewDidEnter() {

    this.setAtenuationForm();

  }

  setAtenuationForm() {
    this.atenuationForm = this.formBuilder.group({
      frecuency: this.formBuilder.control(null, Validators.required),
      frecuencyUnit: this.formBuilder.control(frecuencyUnit.HZ, Validators.required),
    });
    this.showForm = true;
  }

  // Convert the frecuency selected to GHZ unity

  calcFrecuency(frecuency: number, unit: frecuencyUnit): number {

    let frecuencyResult = frecuency;

    if (unit === frecuencyUnit.MHZ) {
      frecuencyResult = frecuencyResult / 1000;
    } else if (unit === frecuencyUnit.HZ) {
      frecuencyResult = frecuencyResult / 1000000000;
    }

    return frecuencyResult;

  }

  getAtenuation() {

    if (this.atenuationForm.valid) {

      let frecuency = this.calcFrecuency(this.atenuationForm.get("frecuency").value, 
                                         this.atenuationForm.get("frecuencyUnit").value);
      
      this.locationService
          .getSpecificAtenuation(this.settingsService.atmosphericPressure, 
                                 this.settingsService.temperature,
                                 frecuency)
          .subscribe((response) => {
            this.atenuationByFrecuency = response.atenuationValue;
          })

    } else {
      console.log("No valido")
    }
  }

  async getLocationData() {

    if (this.settingsService.initialPoint !== defaultPoints) {

      this.generateAtenuationGraph();

    } else {

      this.atenuationGraph = false;

      this.alertService
          .presentAlert("Gráfica de atenuación", 
                        "Por favor selecciona al menos un punto en el mapa para mostrar la gráfica");

    }

  }

  async generateAtenuationGraph() {

    if (this.settingsSetting.initialPoint.lat === 0
        && this.settingsSetting.finalPoint.lat === 0) {
      
    } else {

      const loadingAtmosData = await this.loadingCtrl.create({
        message: 'Obteniendo datos atmosféricos...'
      });

      await loadingAtmosData.present();

      this.locationService
          .getLocationData(this.settingsService.initialPoint.lat.toString(),
                            this.settingsService.initialPoint.lng.toString())
          .subscribe((response) => {
            console.log("weather response ", JSON.stringify(response))

            // Convert temperature from kelvin unity to centigrade unity

            this.settingsService.locationName = response.name;
            this.settingsService.temperature = response.main.temp - 273.15;
            this.settingsService.atmosphericPressure = response.main.pressure;

            loadingAtmosData.dismiss();
            
            setTimeout(() => {
              
              this.createAtenuationGraph();

            }, 300);

          })
    }
  }

  async createAtenuationGraph() {
    
    const loading = await this.loadingCtrl.create({
      message: 'Cargando gráfico...'
    });

    await loading.present();

    this.locationService
        .getAtenuation(this.settingsService.atmosphericPressure, 
                       this.settingsService.temperature)
        .subscribe((response) => {

          let atenuationPoints = response.atenuationsPoints;

          for (let index = 0; index < atenuationPoints.length; index++) {
            this.atenuationDataY.push(atenuationPoints[index].atenuation);
            this.atenuationDataX.push(atenuationPoints[index].frecuency)
          }

          console.log("atenuationDataX ", this.atenuationDataX)
          console.log("atenuationDataY ", this.atenuationDataY)
          console.log("this.atenuationDataY ", this.atenuationDataY.length)

          this.elevationData = {
            data: [
              { x: this.atenuationDataX,
                y: this.atenuationDataY,
                mode: 'lines+markers', // El modo de la serie de datos es "lines" y "markers"
                line: {              // Establecemos la configuracion de la linea
                  shape: 'spline', // Configuramos la forma como "spline"
                  color: '#7f7f7f', // Establecemos el color de la linea
                  width: 1,
                  opacity: 0.5
                }
              },
            ],
            layout: { 
              title: 'Atenuación en Aire Seco',
              yaxis: {
                // showline: false,
                // showgrid: false,
                type: 'log'
              },
              xaxis: {
                // showline: false,
                // showgrid: false,
                type: 'log'
              }
            }
          };

          this.atenuationGraph = true;
          this.loadingCtrl.dismiss();

        });

  }

}
