import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LocationService } from '@shared/services';

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

  constructor(private locationService: LocationService,
              private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.generateAtenuationGraph();
  }

  async generateAtenuationGraph() {

    const loading = await this.loadingCtrl.create({
      message: 'Cargando gráfico...'
    });

    await loading.present();

    this.locationService
        .getAtenuation(1013, 15)
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

        })

  }

}
