import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { LoadingController, ModalController } from '@ionic/angular';
import { GeoPoint, LinkSettings, defaultPoints, frecuencyUnit } from '@shared/models';
import { AlertService, LocationService, SettingsService } from '@shared/services';
import { HomeService } from 'src/app/pages/home/home.service';

@Component({
  selector: 'app-atenuation-graph',
  templateUrl: './atenuation-graph.component.html',
  styleUrls: ['./atenuation-graph.component.scss'],
})
export class AtenuationGraphComponent {

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
  atmosphericForm: FormGroup;
  showForm: boolean = false;
  atenuationByFrecuency: number = 0;
  P1: GeoPoint;
  P2: GeoPoint;

  constructor(private locationService: LocationService,
              private loadingCtrl: LoadingController,
              public homeService: HomeService,
              private alertService: AlertService,
              public settingsService: SettingsService,
              private formBuilder: FormBuilder,
              private screenOrientation: ScreenOrientation,
              private router: Router) { }

  ionViewDidEnter() {

    this.getUserLinks();

  }

  getUserLinks() {

    this.alertService.showLoading("Obteniendo datos del enlace...");
    
    this.settingsService
        .getUserLinks("DSVlv21Tk8ZcPjwwvmrlzzMk2472")
        .then((response: any) => {

          console.log("repsonse ", response)

          const linksSettings: LinkSettings[] = response.linkSettings;

          this.alertService.closeLoading();
          
          this.settingsService.linkSettings = linksSettings[0];

          this.P1 = {...linksSettings[0].P1};
          this.P2 = {...linksSettings[0].P2};
          
          this.getLocationData();
          this.showMap = true;     
          this.setForms();     

        })
        .catch((error) => {
          
          this.getLocationData();
          this.showMap = true;
          this.setForms();

        });

  }


  setForms() {

    this.atenuationForm = this.formBuilder.group({
      frecuency: this.formBuilder.control(this.settingsService.linkSettings.antennaSelected.frecuency === 0 ? null : this.settingsService.linkSettings.antennaSelected.frecuency, Validators.required),
      frecuencyUnit: this.formBuilder.control(frecuencyUnit.GHZ, Validators.required),
    });

    this.atmosphericForm = this.formBuilder.group({
      atmosphericPressure: this.formBuilder.control(this.settingsService.linkSettings.atmosphericPressure === 0 ? null : this.settingsService.linkSettings.atmosphericPressure, Validators.required),
      temperature: this.formBuilder.control(this.settingsService.linkSettings.temperature === 0 ? null : this.settingsService.linkSettings.temperature, Validators.required)
    });

    this.showForm = true;

  }

  showFullScreenMap() {
    this.showMap = false;
    setTimeout(() => {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
      this.router.navigate([`/home/map`]);
    }, 100);
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
        waterDensity: this.settingsService.linkSettings.waterDensity,
        linkName: this.settingsService.linkSettings.linkName
      }

      this.settingsService
          .SetUserLinkSettingsData("DSVlv21Tk8ZcPjwwvmrlzzMk2472", [linkSettings])
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

  showForms() {
    console.log("atmosphericForm ", this.atmosphericForm)
    console.log("atenuationForm ", this.atenuationForm)
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
          .getSpecificAtenuation(this.settingsService.atmosphericPressure, 
                                 this.settingsService.temperature,
                                 frecuency)
          .subscribe((response) => {
            this.atenuationByFrecuency = response.atenuationValue;
          })

    } else {
      this.atmosphericForm.markAllAsTouched();
      this.atenuationForm.markAllAsTouched();
    }
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

      const loadingAtmosData = await this.loadingCtrl.create({
        message: 'Obteniendo datos atmosféricos...'
      });

      await loadingAtmosData.present();

      this.locationService
          .getLocationData(this.settingsService.linkSettings.P1.lat.toString(),
                            this.settingsService.linkSettings.P1.lng.toString())
          .subscribe((response) => {

            console.log("weather response ", JSON.stringify(response))

            // Convert temperature from kelvin unity to centigrade unity

            this.settingsService.locationName = response.name;
            this.settingsService.temperature = Number((response.main.temp - 273.15).toString().substring(0, 10));
            this.settingsService.atmosphericPressure = response.main.pressure;
            this.atmosphericForm.get("temperature").setValue(this.settingsService.temperature);
            this.atmosphericForm.get("atmosphericPressure").setValue(this.settingsService.atmosphericPressure);

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

        });

  }

}
