import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { frecuencyUnit } from '@shared/models';
import { LocationService, SettingsService } from '@shared/services';

@Component({
  selector: 'app-atenuation-water-vapor-graph',
  templateUrl: './atenuation-water-vapor-graph.component.html',
  styleUrls: ['./atenuation-water-vapor-graph.component.scss'],
})
export class AtenuationWaterVaporGraphComponent implements OnInit {

  atenuationData: any;
  atenuationDataX: number[] = [];
  atenuationDataY: number[] = [];
  atenuationGraph: boolean = false;
  elevationData: any;
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
              private formBuilder: FormBuilder,
              public settingsService: SettingsService) { }

  ngOnInit() {
    this.generateAtenuationGraph();
  }

  async generateAtenuationGraph() {

    const loading = await this.loadingCtrl.create({
      message: 'Cargando gráfico...'
    });

    await loading.present();

    this.locationService
        .getWaterVaporAtenuation(1013, 15, 7.5)
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
              title: 'Atenuación por Vapor de Agua',
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

        })

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

}
