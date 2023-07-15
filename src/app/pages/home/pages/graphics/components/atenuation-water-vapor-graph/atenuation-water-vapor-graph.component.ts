import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { defaultPoints, frecuencyUnit } from '@shared/models';
import { AlertService, LocationService, SettingsService } from '@shared/services';
import { HomeService } from 'src/app/pages/home/home.service';

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
  atmosphericForm: FormGroup;
  showForm: boolean = false;
  atenuationByFrecuency: number = 0;

  constructor(private locationService: LocationService,
              private loadingCtrl: LoadingController,
              private formBuilder: FormBuilder,
              public settingsService: SettingsService,
              public homeService: HomeService,
              private alertService: AlertService) { }

  ngOnInit() {
    this.homeService.showMap = true;

    this.getLocationData();
  }

  ionViewDidEnter() {

    this.setForms();

  }

  setForms() {

    this.atenuationForm = this.formBuilder.group({
      frecuency: this.formBuilder.control(null, Validators.required),
      frecuencyUnit: this.formBuilder.control(frecuencyUnit.HZ, Validators.required),
    });

    this.atmosphericForm = this.formBuilder.group({
      atmosphericPressure: this.formBuilder.control(null, Validators.required),
      temperature: this.formBuilder.control(null, Validators.required),
      waterDensity: this.formBuilder.control(null, Validators.required)
    });

    this.showForm = true;

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

    if (this.settingsService.initialPoint.lat === 0
      && this.settingsService.finalPoint.lat === 0) {
    
  } else {

    const loading = await this.loadingCtrl.create({
      message: 'Obteniendo datos atmosféricos...'
    });

    await loading.present();

    this.locationService
          .getLocationData(this.settingsService.initialPoint.lat.toString(),
                            this.settingsService.initialPoint.lng.toString())
          .subscribe((response) => {

            // Convert temperature from kelvin unity to centigrade unity

            this.settingsService.locationName = response.name;
            this.settingsService.temperature = response.main.temp - 273.15;
            this.settingsService.atmosphericPressure = response.main.pressure;
            this.settingsService.waterDensity = 7.5;
            this.atmosphericForm.get("temperature").setValue(this.settingsService.temperature);
            this.atmosphericForm.get("atmosphericPressure").setValue(this.settingsService.atmosphericPressure);
            this.atmosphericForm.get("waterDensity").setValue(7.5);

            this.locationService
                .getWaterVaporAtenuation(response.main.pressure, this.settingsService.temperature, 7.5)
                .subscribe((response) => {
        
                  let atenuationPoints = response.atenuationsPoints;
        
                  for (let index = 0; index < atenuationPoints.length; index++) {
                    this.atenuationDataY.push(atenuationPoints[index].atenuation);
                    this.atenuationDataX.push(atenuationPoints[index].frecuency)
                  }
                
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
                        type: 'log',
                        title: 'Atenuación específica (dB/Km)'
                      },
                      xaxis: {
                        // showline: false,
                        // showgrid: false,
                        type: 'log',
                        title: 'Frecuencia (Ghz)'
                      }
                    }
                  };
        
                  this.atenuationGraph = true;
                  this.loadingCtrl.dismiss();
        
                })
          })
    }
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

    if (this.atenuationForm.valid
        && this.atmosphericForm.valid) {

      let frecuency = this.calcFrecuency(this.atenuationForm.get("frecuency").value, 
                                         this.atenuationForm.get("frecuencyUnit").value);
      
      this.locationService
          .getSpecificWaterVaporAtenuation(this.settingsService.atmosphericPressure, 
                                          this.settingsService.temperature,
                                          7.5,
                                          frecuency)
          .subscribe((response) => {
            this.atenuationByFrecuency = response.atenuationValue;
          })

    } else {
      this.atmosphericForm.markAllAsTouched();
      this.atenuationForm.markAllAsTouched();
    }
  }

}
