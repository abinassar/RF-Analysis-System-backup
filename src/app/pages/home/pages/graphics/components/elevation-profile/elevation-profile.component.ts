import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { GeoPoint, defaultPoints } from '@shared/models';
import { AlertService, LocationService, SettingsService } from '@shared/services';

const SPEED_OF_LIGHT: number = 299792458;

@Component({
  selector: 'app-elevation-profile',
  templateUrl: './elevation-profile.component.html',
  styleUrls: ['./elevation-profile.component.scss'],
})
export class ElevationProfileComponent implements OnInit {

  initialPoint: GeoPoint;
  finalPoint: GeoPoint;

  // Lambda referente a una freceucnia de 20 Ghz  

  lambda: number = SPEED_OF_LIGHT/(20 * 1e9);
  distance1!: number;
  distance2!: number;
  dataFresnelx: number[] = [];
  dataFresnely: number[] = [];
  dataFresnelyInverted: number[] = [];
  graph: any;

  elevationData: any;
  elevationDataX: number[] = [];
  elevationDataY: number[] = [];
  elevationGraph: boolean = false;

  atenuationData: any;
  atenuationDataX: number[] = [];
  atenuationDataY: number[] = [];
  atenuationGraph: boolean = false;

  distanceFractioned!: number;
  distanceFraction!: number;

  responsesData: any[] = [];

  requestArray: any[] = [];
  firstIteration: boolean = true;

  elevationTotalDataX: number[] = [];
  elevationTotalDataY: number[] = [];

  obstructionPointsX: number[] = [];
  obstructionPointsInvertedX: number[] = [];
  obstructionPointsY: number[] = [];
  obstructionPointsInvertedY: number[] = [];

  anthenaOneHeight: number = 5;
  anthenaTwoHeight: number = 3;

  pointsFraction: number = 1000;

  antennaSettingsObservable = this.settingsService
                                  .linkSettings$
                                  .subscribe((settings) => {

      this.anthenaOneHeight = settings.anthenaOneHigh;
      this.anthenaTwoHeight = settings.anthenaTwoHigh;

  });

  settingsForm: FormGroup;
  showForm: boolean = false;
  obstructionSelectedPoints: any[] = [];
  startObstruction: boolean = false;

  constructor(private settingsService: SettingsService,
              private locationService: LocationService,
              private alertService: AlertService,
              private loadingCtrl: LoadingController) { }

  ngOnInit() {

    this.initialPoint = this.settingsService.initialPoint;
    this.finalPoint = this.settingsService.finalPoint;

    if (this.initialPoint !== defaultPoints
        && this.finalPoint) {

      this.getElevationProfile();

    } else {

      this.alertService
          .presentAlert("Puntos geográficos", 
                        "Por favor selecciona dos puntos geograficos para mostrar la gráfica");

    }

  }

  showObstructions() {
    console.log("this.obstructionSelectedPoints ", this.obstructionSelectedPoints)
  }

  async getElevationProfile() {

    const loading = await this.loadingCtrl.create({
      message: 'Cargando perfil de elevación...'
    });

    await loading.present();

    this.locationService
        .getElevationProfile(this.initialPoint, this.finalPoint)
        .subscribe((response) => {

      console.log("data: ", JSON.stringify(response.elevations))

      let distanceFraction = response.distances*1000/this.pointsFraction;
      let positionX = 0;

      console.log("distanceFraction: ", distanceFraction)

      let elevationProfileData = response.elevations;
  
      // Get point x and y for each position in map
  
      for (let index = 0; index < elevationProfileData.length; index++) {
        
        this.elevationDataX.push(positionX);
        this.elevationDataY.push(elevationProfileData[index]);
  
        positionX += distanceFraction;
      }

      // Declaro la configuraion de la grafica para que sea 
      // Una gracias de lineas suaves
      // Ademas, uso la funcion de interpolacion para que los puntos que hay
      // repetidos se cambien y asi generar una grafica continua y no cuadrada

      console.log("this.elevationDataX ", this.elevationDataX)
      console.log("this.elevationDataY ", this.elevationDataY)

      this.elevationDataY = this.interpolateArray(this.elevationDataY);

      this.elevationData = {
        data: [
          { x: this.elevationDataX,
            y: this.elevationDataY,
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
          title: 'Gráfico de elevación',
          yaxis: {
            showline: false,
            showgrid: false
          },
          xaxis: {
            showline: false,
            showgrid: false
          }
        }
      };

      // Agregar la altura por defecto de la elevacion de la tierra
      // A la altura de la antena

      this.anthenaOneHeight += this.elevationDataY[0];
      this.anthenaTwoHeight += this.elevationDataY[this.elevationDataY.length - 1];

      console.log("this.anthenaOneHeight ", this.anthenaOneHeight)
      console.log("this.anthenaTwoHeight ", this.anthenaTwoHeight)

      this.createElipseCurve(this.elevationDataX[0], 
                            this.anthenaOneHeight, 
                            this.elevationDataX[this.elevationData.data[0].x.length - 1], 
                            this.anthenaTwoHeight,
                            this.pointsFraction);
                                
      this.elevationGraph = true;
      this.loadingCtrl.dismiss();

    })

  }

  createElipseCurve(Xinitial: number, 
                    Yinitial: number, 
                    Xfinal: number, 
                    Yfinal: number,
                    fraction: number = this.pointsFraction) {

                      console.log("lambda ", this.lambda)
                      console.log("fraction ", fraction)

    // console.log("Xinitial ", Xinitial)
    // console.log("Xfinal ", Xfinal)
    // console.log("Yinitial ", Yinitial)
    // console.log("Yfinal ", Yfinal)

    let diferenceX = Math.abs(Xfinal - Xinitial);
    let diferenceY = Math.abs(Yfinal - Yinitial);

    // console.log("Diferencia puntos x ", diferenceX);
    // console.log("Diferencia puntos y ", diferenceY);

    // Calculo el largo de la recta del elipse

    let rectDistance = Math.sqrt(Math.pow(diferenceX, 2) + Math.pow(diferenceY, 2));

    // console.log('distancia de la recta ', rectDistance);

    let xFractioned = Math.abs(Xfinal - Xinitial)/fraction;

    // Calculo la pendiente de la recta

    let mRect = (Yfinal - Yinitial)/(Xfinal - Xinitial);
    let angleRectDegree;

    console.log("pendiente de la recta ", mRect)

    // Calculo el angulo de la recta

    if (mRect === 0) {
      angleRectDegree = 0;
    } else {
      angleRectDegree = Math.atan(mRect);
    }

    // console.log("angulo de la recta en grados", angleRectDegree)

    // Transformo el angulo de la recta en radianes

    let angleRectRadian = (angleRectDegree*Math.PI)/180;

    let angleClkSenseTransferred = angleRectRadian + Math.PI/2;
    let angleCounterClkSenseTransferred = angleRectRadian - Math.PI/2;

    // Traslado el angulo de la recta tanto en sentido horario
    // Como contrario al sentido horario para tener las rectas
    // Perpendiculares "imaginarias" que me daran cada uno de los
    // Puntos de la curva de la elipse de fresnel con la variacion del radio
    // a lo largo de la recta

    if (angleClkSenseTransferred < 0) {
      angleClkSenseTransferred += 2*Math.PI;
    }

    if (angleCounterClkSenseTransferred < 0) {
      angleCounterClkSenseTransferred += 2*Math.PI;
    }

    console.log("Angulo de la recta en radianes", angleRectRadian)

    console.log("Angulo transladado ens entido de agujas del reloj ", angleClkSenseTransferred)
    console.log("Angulo transladado ens entido contrario de agujas del reloj ", angleCounterClkSenseTransferred)

    let P1x = Xinitial;
    let P1y = Yinitial;
    let PFinalFractionX = P1x + xFractioned;

    let rectDataX: number[] = [];
    let rectDataY: number[] = [];

    let fresnelDataX: number[] = [];
    let fresnelDataY: number[] = [];

    let fresnelInvertedDataX: number[] = [];
    let fresnelInvertedDataY: number[] = [];

    this.obstructionPointsX = [];
    this.obstructionPointsY = [];

    this.obstructionPointsInvertedX = [];
    this.obstructionPointsInvertedY = [];

    // Push the initial point of rect

    let distance1 = 0;
    let distance2 = rectDistance - distance1;

    // Determino la distancia que hay en cada aumento de fraccion
    // Para cada ciclo
    
    let distanceFraction = rectDistance/fraction;

    let fresnelPoints = this.createFresnelPoints(1,
                                                fraction, 
                                                rectDataX, 
                                                rectDataY, 
                                                P1x, 
                                                P1y, 
                                                distance1, 
                                                distance2, 
                                                angleCounterClkSenseTransferred, 
                                                angleClkSenseTransferred,
                                                Xfinal,
                                                Yfinal,
                                                Xinitial,
                                                Yinitial,
                                                fresnelDataX,
                                                fresnelDataY,
                                                fresnelInvertedDataX,
                                                fresnelInvertedDataY,
                                                mRect,
                                                xFractioned,
                                                distanceFraction);

    let fresnel70PercentPoints = this.createFresnelPoints(0.7,
                                                fraction, 
                                                rectDataX, 
                                                rectDataY, 
                                                P1x, 
                                                P1y, 
                                                distance1, 
                                                distance2, 
                                                angleCounterClkSenseTransferred, 
                                                angleClkSenseTransferred,
                                                Xfinal,
                                                Yfinal,
                                                Xinitial,
                                                Yinitial,
                                                fresnelDataX,
                                                fresnelDataY,
                                                fresnelInvertedDataX,
                                                fresnelInvertedDataY,
                                                mRect,
                                                xFractioned,
                                                distanceFraction);
    // TODO: Put fresnel points function

    this.elevationData.data.push({
      x: fresnel70PercentPoints.fresnelDataX,
      y: fresnel70PercentPoints.fresnelDataY,
      type: 'scatter',
      line: {
        color: '#9a37c4'
      }
    })

    this.elevationData.data.push({
      x: fresnel70PercentPoints.fresnelInvertedDataX,
      y: fresnel70PercentPoints.fresnelInvertedDataY,
      type: 'scatter',
      line: {
        color: '#9a37c4'
      }
    })

    // this.elevationData.data.push({
    //   x: fresnelPoints.fresnelDataX,
    //   y: fresnelPoints.fresnelDataY,
    //   type: 'scatter',
    //   line: {
    //     color: '#17BECF'
    //   }
    // })

    // this.elevationData.data.push({
    //   x: fresnelPoints.fresnelInvertedDataX,
    //   y: fresnelPoints.fresnelInvertedDataY,
    //   type: 'scatter',
    //   line: {
    //     color: '#17BECF'
    //   }
    // })

    this.elevationData.data.push({
      x: fresnelPoints.rectDataX,
      y: fresnelPoints.rectDataY,
      type: 'scatter'
    })

    this.elevationData.data.push({
      x: this.obstructionPointsX,
      y: this.obstructionPointsY,
      mode: 'markers',
      type: 'scatter',
      line: {
        color: '#d91313'
      }
    })

    this.elevationData.data.push({
      x: this.obstructionPointsInvertedX,
      y: this.obstructionPointsInvertedY,
      mode: 'markers',
      type: 'scatter',
      line: {
        color: '#d91313'
      }
    })

    this.elevationGraph = true;

  }

  createFresnelPoints(radioPercent = 1,
                      fraction, 
                      rectDataX, 
                      rectDataY, 
                      P1x, 
                      P1y, 
                      distance1, 
                      distance2, 
                      angleCounterClkSenseTransferred, 
                      angleClkSenseTransferred,
                      Xfinal,
                      Yfinal,
                      Xinitial,
                      Yinitial,
                      fresnelDataX,
                      fresnelDataY,
                      fresnelInvertedDataX,
                      fresnelInvertedDataY,
                      mRect,
                      xFractioned,
                      distanceFraction) {

    for (let index = 0; index <= fraction; index++) {
      
      // Add point to rect data
        
      rectDataX.push(P1x);
      rectDataY.push(P1y);

      // Create the fresnel zone points

      let radio = radioPercent * this.fresnelRadio(this.lambda, distance1, distance2);

      if (radio < 0.00001) {
        radio = 0;
      }
      // Get the point Y and X of fresnel in positive and negative

      let fresnelPositiveXPoint;
      let fresnelNegativeXPoint;
      
      let fresnelPositiveYPoint;
      let fresnelNegativeYPoint;

      if (radio !== 0
          && !Number.isNaN(radio)) {
  
        fresnelPositiveXPoint = this.getXTranferredPoint(P1x, radio, angleCounterClkSenseTransferred);
        fresnelNegativeXPoint = this.getXTranferredPoint(P1x, radio, angleClkSenseTransferred);
        
        fresnelPositiveYPoint = this.getYTranferredPoint(P1y, radio, angleCounterClkSenseTransferred);
        fresnelNegativeYPoint = this.getYTranferredPoint(P1y, radio, angleClkSenseTransferred);
        
      } else {

        // Evaluo si estoy parado en el punto inicial o final

        if (index === fraction) {

          fresnelPositiveXPoint = Xfinal; 
          fresnelNegativeXPoint = Xfinal; 
          
          fresnelPositiveYPoint = Yfinal; 
          fresnelNegativeYPoint = Yfinal; 
          
        } else {

          fresnelPositiveXPoint = Xinitial; 
          fresnelNegativeXPoint = Xinitial; 
          
          fresnelPositiveYPoint = Yinitial; 
          fresnelNegativeYPoint = Yinitial; 

        }
      }

      fresnelDataX.push(fresnelPositiveXPoint);
      fresnelInvertedDataX.push(fresnelNegativeXPoint);

      fresnelDataY.push(fresnelPositiveYPoint);
      fresnelInvertedDataY.push(fresnelNegativeYPoint);

      P1y = this.getFinalPointY(mRect, (P1x + xFractioned), P1x, P1y);
      P1x += xFractioned;

      // // Update the distance 1 and distance 2 to next loop
  
      distance1 += distanceFraction;
      distance2 = Math.abs(distance2 - distanceFraction);

    }

    this.elevationDataY.forEach((elevationProfilePointY, index) => {

      // Busco un punto que este mas o menos en el valor de x de la zona de fresnel
      
      let indexOfPositionX = fresnelDataX.findIndex((fresnelPointX) => {
        return (fresnelPointX > this.elevationDataX[index] - distanceFraction 
               && fresnelPointX < this.elevationDataX[index] + distanceFraction);
      });

      if (elevationProfilePointY >= fresnelDataY[indexOfPositionX]) {

        if (!this.startObstruction) {
          this.startObstruction = true;
           this.obstructionSelectedPoints.push({
            x: fresnelDataX[indexOfPositionX],
            y: fresnelDataX[indexOfPositionX]
           });
        }

        this.obstructionPointsX.push(fresnelDataX[indexOfPositionX]);
        this.obstructionPointsY.push(fresnelDataY[indexOfPositionX]);

      } else {

        this.startObstruction = false;

      }

      let indexOfPositionInvertedX = fresnelInvertedDataX.findIndex((fresnelPointX) => {
        return (fresnelPointX > this.elevationDataX[index] - distanceFraction 
               && fresnelPointX < this.elevationDataX[index] + distanceFraction);
      });

      if (elevationProfilePointY >= fresnelInvertedDataY[indexOfPositionInvertedX]) {

        console.log("indexOfPositionInvertedX ", indexOfPositionInvertedX)
        
        this.obstructionPointsInvertedX.push(fresnelInvertedDataX[indexOfPositionInvertedX]);
        this.obstructionPointsInvertedY.push(fresnelInvertedDataY[indexOfPositionInvertedX]);

      }

    });

    let fresnelPoints = {
      fresnelDataX,
      fresnelDataY,
      fresnelInvertedDataX,
      fresnelInvertedDataY,
      rectDataX,
      rectDataY
    }

    return fresnelPoints;

  }

  getFinalPointY(mRect:number, Xfinal:number, Xinitial:number, Yinitial:number): number {

    // Return the result of final point y of rect

    return (mRect * (Xfinal - Xinitial)) + Yinitial;
  }

  getXTranferredPoint(xInitial: number, distance: number, angle: number): number {
    return xInitial + distance * Math.cos(angle);
  }

  getYTranferredPoint(yInitial: number, distance: number, angle: number): number {
    return yInitial + distance * Math.sin(angle);
  }

  interpolateArray(arr) {
    const result = [];
    let prev = arr[0];
    let count = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] === prev) {
        count++;
      } else {
        const diff = (arr[i] - prev) / (count + 1);
        for (let j = 1; j <= count + 1; j++) {
          result.push(prev + j * diff);
        }
        prev = arr[i];
        count = 0;
      }
    }
    result.push(prev);
    return result;
  }

  fresnelRadio(lambda: number, d1: number, d2: number): number {
    return Math.sqrt((lambda*d1*d2)/(d1 + d2));
  }

}
