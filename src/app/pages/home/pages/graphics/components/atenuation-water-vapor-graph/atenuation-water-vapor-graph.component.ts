import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { LoadingController } from '@ionic/angular';
import { GeoPoint, LinkSettings, defaultPoints, frecuencyUnit } from '@shared/models';
import { AlertService, LocationService, SettingsService } from '@shared/services';
import { HomeService } from 'src/app/pages/home/home.service';

@Component({
  selector: 'app-atenuation-water-vapor-graph',
  templateUrl: './atenuation-water-vapor-graph.component.html',
  styleUrls: ['./atenuation-water-vapor-graph.component.scss'],
})
export class AtenuationWaterVaporGraphComponent {

  atenuationData: any;
  atenuationDataX: number[] = [];
  atenuationDataY: number[] = [];
  atenuationGraph: boolean = false;
  frecuenciesUnits: frecuencyUnit[] = [
    frecuencyUnit.HZ,
    frecuencyUnit.MHZ,
    frecuencyUnit.GHZ
  ];
  atenuationForm: FormGroup;
  atmosphericForm: FormGroup;
  showForm: boolean = false;
  atenuationByFrecuency: number = 0;
  showMap: boolean = false;
  P1: GeoPoint;
  P2: GeoPoint;

  constructor(private locationService: LocationService,
              private loadingCtrl: LoadingController,
              private formBuilder: FormBuilder,
              public settingsService: SettingsService,
              public homeService: HomeService,
              private alertService: AlertService,
              private screenOrientation: ScreenOrientation,
              private router: Router) { }

  async ionViewDidEnter() {

    await this.homeService.getUserLinks();

    this.P1 = {...this.settingsService.linkSettings.P1};
    this.P2 = {...this.settingsService.linkSettings.P2};
    
    this.getLocationData();
    this.showMap = true;     
    this.setForms();   

  }

  setForms() {

    this.atenuationForm = this.formBuilder.group({
      frecuency: this.formBuilder.control(this.settingsService.linkSettings.antennaSelected.frecuency === 0 ? null : this.settingsService.linkSettings.antennaSelected.frecuency, Validators.required),
      frecuencyUnit: this.formBuilder.control(frecuencyUnit.GHZ, Validators.required),
    });

    this.atmosphericForm = this.formBuilder.group({
      atmosphericPressure: this.formBuilder.control(this.settingsService.linkSettings.atmosphericPressure === 0 ? null : this.settingsService.linkSettings.atmosphericPressure, Validators.required),
      temperature: this.formBuilder.control(this.settingsService.linkSettings.temperature === 0 ? null : this.settingsService.linkSettings.temperature, Validators.required),
      waterDensity: this.formBuilder.control(this.settingsService.linkSettings.waterDensity === 0 ? null : this.settingsService.linkSettings.waterDensity, Validators.required)
    });

    this.showForm = true;

  }
  
  saveLinkSettings() {

    if (this.atmosphericForm.valid) {

      this.alertService.showLoading("Guardando datos del enlace...")
      
      const linkSettings: LinkSettings = {
        P1: this.settingsService.linkSettings.P1,
        P2: this.settingsService.linkSettings.P2,
        antennaOneHeight: this.settingsService.linkSettings.antennaOneHeight,
        antennaTwoHeight: this.settingsService.linkSettings.antennaTwoHeight,
        antennaSelected: this.settingsService.linkSettings.antennaSelected,
        atmosphericPressure: this.atmosphericForm.get("atmosphericPressure").value,
        temperature: this.atmosphericForm.get("temperature").value,
        waterDensity: this.atmosphericForm.get("waterDensity").value,
        linkName: this.settingsService.linkSettings.linkName,
        selected: true
      }

      this.settingsService
          .SetUserLinkSettingsData(this.homeService.getUserId, [linkSettings])
          .subscribe((response) => {

            this.alertService.closeLoading();

          },
          (error) => {
            this.alertService.closeLoading();
            this.alertService.presentAlert("Hubo un problema guardando la configuracion",
                                           "Por favor, intenta mas tarde")
          });

    } else {

      this.atmosphericForm.markAllAsTouched();
      this.alertService
          .presentAlert("Salvar configuración", 
                        "Por favor completa los datos de temperature y presión para poder guardar los datos del enlace");

    }

  }

  showFullScreenMap() {
    this.showMap = false;
    setTimeout(() => {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
      this.router.navigate([`/home/map`]);
    }, 100);
  }

  async getLocationData() {

    if (this.settingsService.linkSettings.P1 !== defaultPoints) {

      this.generateAtenuationGraph();

    } else {

      this.atenuationGraph = false;

      this.alertService
          .presentAlert("Gráfica de atenuación", 
                        "Por favor selecciona al menos un punto en el mapa para mostrar la gráfica");

    }

  }

  async generateAtenuationGraph() {

    this.P1 = {...this.settingsService.linkSettings.P1};
    this.P2 = {...this.settingsService.linkSettings.P2};

    if (this.settingsService.linkSettings.P1.lat === 0
        && this.settingsService.linkSettings.P2.lat === 0) {
      
    } else {

      const loading = await this.loadingCtrl.create({
        message: 'Obteniendo datos atmosféricos...'
      });

      await loading.present();

      this.locationService
            .getLocationData(this.settingsService.linkSettings.P1.lat.toString(),
                              this.settingsService.linkSettings.P1.lng.toString())
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
                  
                    this.atenuationData = {
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
                        // title: 'Atenuación por Vapor de Agua',
                        yaxis: {
                          // showline: false,
                          // showgrid: false,
                          type: 'log',
                          // title: 'Atenuación específica (dB/Km)'
                        },
                        xaxis: {
                          // showline: false,
                          // showgrid: false,
                          type: 'log',
                          // title: 'Frecuencia (Ghz)'
                        },
                        margin: {
                          l: 40,
                          r: 20,
                          t: 20,
                          b: 20
                        }
                      }
                    };
          
                    this.atenuationGraph = true;
                    this.loadingCtrl.dismiss();
          
                  })
            })
    }
  }

  showFullScreenGraphic() {
    localStorage.setItem("graphic-data", JSON.stringify(this.atenuationData.data));
    localStorage.setItem("graphic-layout", JSON.stringify(this.atenuationData.layout));
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    this.router.navigate([`/home/graphic`]);
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
