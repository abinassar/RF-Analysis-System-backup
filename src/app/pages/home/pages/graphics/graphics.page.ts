import { Component } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, MenuController } from '@ionic/angular';
import { DataService } from '../../../../shared/services/data.service';
import { SettingsService } from '../../../../shared/services/settings.service';
import { LocationService } from '../../../../shared/services/location.service';
import { GeoPoint } from '../../../../shared/models/geographic';
import { AlertService } from '../../../../shared/services/alert.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

const SPEED_OF_LIGHT: number = 299792458;

@Component({
  selector: 'app-graphics',
  templateUrl: './graphics.page.html',
  styleUrls: ['./graphics.page.scss'],
})
export class GraphicsPage {

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

  initialPoint: GeoPoint;
  finalPoint: GeoPoint;

  pointsFraction: number = 1000;

  antennaSettingsObservable = this.settingsService
                                  .linkSettings$
                                  .subscribe((settings) => {

      this.anthenaOneHeight = settings.anthenaOneHigh;
      this.anthenaTwoHeight = settings.anthenaTwoHigh;

  });

  settingsForm: FormGroup;
  showForm: boolean = false;

  constructor( private dataService: DataService,
               private loadingCtrl: LoadingController,
               private actionSheetController: ActionSheetController,
               private menu: MenuController,
               private settingsService: SettingsService,
               private locationService: LocationService,
               private alertService: AlertService,
               private router: Router,
               private formBuilder: FormBuilder ) {}

  ionViewDidEnter() {

    this.initialPoint = this.settingsService.initialPoint;
    this.finalPoint = this.settingsService.finalPoint;

    this.setSettingsForm();
    this.showForm = true;

    // this.locationService
    //     .getLocationData('10.482149', '-68.056942')
    //     .subscribe((response) => {
          
    //     });

    // this.locationService
    //     .getAtenuation(1013, 15)
    //     .subscribe((response) => {

    //       let atenuationPoints = response.atenuationsPoints;

    //       for (let index = 0; index < atenuationPoints.length; index++) {
    //         this.atenuationDataY.push(atenuationPoints[index].atenuation);
    //         this.atenuationDataX.push(atenuationPoints[index].frecuency)
    //       }

    //       console.log("atenuationDataX ", this.atenuationDataX)
    //       console.log("atenuationDataY ", this.atenuationDataY)
    //       console.log("this.atenuationDataY ", this.atenuationDataY.length)

    //       this.elevationData = {
    //         data: [
    //           { x: this.atenuationDataX,
    //             y: this.atenuationDataY,
    //             mode: 'lines+markers', // El modo de la serie de datos es "lines" y "markers"
    //             line: {              // Establecemos la configuracion de la linea
    //               shape: 'spline', // Configuramos la forma como "spline"
    //               color: '#7f7f7f', // Establecemos el color de la linea
    //               width: 1,
    //               opacity: 0.5
    //             }
    //           },
    //         ],
    //         layout: { 
    //           title: 'Gráfico de Atenuacion en Aire Seco',
    //           yaxis: {
    //             // showline: false,
    //             // showgrid: false,
    //             type: 'log'
    //           },
    //           xaxis: {
    //             // showline: false,
    //             // showgrid: false,
    //             type: 'log'
    //           }
    //         }
    //       };

    //       this.atenuationGraph = true;


    //     })


    // if (this.initialPoint
    //     && this.finalPoint) {

    //   this.getElevationProfile();

    // } else {

    //   this.alertService
    //       .presentAlert("Puntos geográficos", 
    //                     "Por favor selecciona dos puntos geograficos para mostrar la gráfica");

    // }
  }

  setSettingsForm() {

    this.settingsForm = this.formBuilder.group({
      initialLat: this.formBuilder.control(this.initialPoint.lat === 0 ? null : this.initialPoint.lat),
      initialLng: this.formBuilder.control(this.initialPoint.lng === 0 ? null : this.initialPoint.lng),
      finalLat: this.formBuilder.control(this.finalPoint.lat === 0 ? null : this.finalPoint.lat),
      finalLng: this.formBuilder.control(this.finalPoint.lng === 0 ? null : this.finalPoint.lng),
    });

    console.log("this.settingsForm ", this.settingsForm)
  }

  navToProfileGraph() {
    this.router.navigate([`/home/graphics/elevation-profile`]);
  }

  navToAtenuationGraph() {
    this.router.navigate(['/home/graphics/atenuation-graph']);
  }

  navToAtenuationVaporGraph() {
    this.router.navigate(['/home/graphics/atenuation-water-vapor-graph']);
  }

  interpolateArrayParabolic(arr) {
    const result = [];
    let prev = arr[0];
    let count = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] === prev) {
        count++;
      } else {
        if (count === 1) {
          result.push(prev);
        } else if (count === 2) {
          result.push(prev);
          result.push((prev + arr[i]) / 2);
        } else {
          const p0 = Math.max(i - count - 1, 0);
          const p1 = i - count - 1;
          const p2 = i - 1;
          const x0 = p0 + 1;
          const x1 = p1 + 1;
          const x2 = p2 + 1;
          const y0 = arr[p0];
          const y1 = arr[p1];
          const y2 = arr[p2];
          const a = ((y0 - y1) * (x1 - x2) - (y1 - y2) * (x0 - x1)) / ((x1 * x1 - x2 * x2) * (x1 - x0) - (x0 * x0 - x1 * x1) * (x2 - x1));
          const b = ((y0 - y1) - a * (x0 * x0 - x1 * x1)) / (x0 - x1);
          const c = y0 - a * x0 * x0 - b * x0;
          for (let j = 1; j <= count + 1; j++) {
            const x = i - count - 1 + j;
            result.push(a * x * x + b * x + c);
          }
        }
        prev = arr[i];
        count = 0;
      }
    }
    result.push(prev);
    return result;
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

  getLatLonInAnyDistance(lat1: number, 
                         lon1: number, 
                         lat2: number,
                         distance: number, 
                         bearing: number) {

    // All values should be in radians

    let lat1Radian = lat1 * (Math.PI)/180;
    let lat2Radian = lat2 * (Math.PI)/180;
    let lon1Radian = lon1 * (Math.PI)/180;
    let bearingRadian = bearing * (Math.PI)/180;
    
    const R = 6371;

    // angular distance ( distance should be in km )

    let distanceInKM = distance/this.pointsFraction;

    const δ = distanceInKM/R;

    // ‘projected’ latitude difference

    const latFinal2 = Math.asin( Math.sin(lat1Radian)*Math.cos(δ) +
                      Math.cos(lat1Radian)*Math.sin(δ)*Math.cos(bearingRadian) );
    const lonFinal2 = lon1Radian + Math.atan2(Math.sin(bearingRadian)*Math.sin(δ)*Math.cos(lat1Radian),
                              Math.cos(δ)-Math.sin(lat1Radian)*Math.sin(lat2Radian));
    
    // check for some daft bugger going past the pole, normalise latitude if so
    // if (Math.abs(lat2) > Math.PI/2) lat2 = lat2>0 ? Math.PI-lat2 : -Math.PI-lat2;

      return [latFinal2 * 180/Math.PI,
              lonFinal2 * 180/Math.PI];

  }

  getLatLonInAnyDistance2(lat1: number, 
                          lon1: number, 
                          distance: number, 
                          bearing: number) {
    
    const R = 6371e3;

    // ‘projected’ latitude difference

    const lat2 = Math.asin( Math.sin(lat1)*Math.cos(distance/R) +
                            Math.cos(lat1)*Math.sin(distance/R)*Math.cos(bearing) );

    const lon2 = lon1 + Math.atan2(Math.sin(bearing)*Math.sin(distance/R)*Math.cos(lat1),
                              Math.cos(distance/R)-Math.sin(lat1)*Math.sin(lat2));

    
    // check for some daft bugger going past the pole, normalise latitude if so
    // if (Math.abs(lat2) > Math.PI/2) lat2 = lat2>0 ? Math.PI-lat2 : -Math.PI-lat2;

    return {
      lat2,
      lon2
    }
  }

  getBearing (lat1: number, 
              lon1: number, 
              lat2: number, 
              lon2: number): number {

    let lat1Radian = lat1 * (Math.PI)/180;
    let lat2Radian = lat2 * (Math.PI)/180;
    let lon1Radian = lon1 * (Math.PI)/180;
    let lon2Radian = lon2 * (Math.PI)/180;

    const y = Math.sin(lon2Radian-lon1Radian) * Math.cos(lat2Radian);
    const x = Math.cos(lat1Radian)*Math.sin(lat2Radian) -
              Math.sin(lat1Radian)*Math.cos(lat2Radian)*Math.cos(lon2Radian-lon1Radian);
    const θ = Math.atan2(y, x);
    const bearing = (θ*180/Math.PI + 360) % 360; // in degrees

    return bearing

  }

  getDistanceBetweenPoints (lat1: number, 
                            lon1: number, 
                            lat2: number, 
                            lon2: number): number {

    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres

    return d;
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

    for (let index = 0; index <= fraction; index++) {
      
      // Add point to rect data
        
      rectDataX.push(P1x);
      rectDataY.push(P1y);

      // Create the fresnel zone points

      let radio = this.fresnelRadio(this.lambda, distance1, distance2);

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

    console.log("this.elevationDataY ", this.elevationDataY)
    console.log("this.elevationDataX ", this.elevationDataX)
    console.log("this.fresnelDataY ", fresnelDataY)
    console.log("this.fresnelDataX ", fresnelDataX)

    this.elevationDataY.forEach((elevationProfilePointY, index) => {

      // Busco un punto que este mas o menos en el valor de x de la zona de fresnel
      
      let indexOfPositionX = fresnelDataX.findIndex((fresnelPointX) => {
        return (fresnelPointX > this.elevationDataX[index] - distanceFraction 
               && fresnelPointX < this.elevationDataX[index] + distanceFraction);
      });

      if (elevationProfilePointY >= fresnelDataY[indexOfPositionX]) {

        console.log("indexOfPositionX ", indexOfPositionX)

        this.obstructionPointsX.push(fresnelDataX[indexOfPositionX]);
        this.obstructionPointsY.push(fresnelDataY[indexOfPositionX]);

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

    })

    this.elevationData.data.push({
      x: fresnelDataX,
      y: fresnelDataY,
      type: 'scatter',
      line: {
        color: '#17BECF'
      }
    })

    this.elevationData.data.push({
      x: fresnelInvertedDataX,
      y: fresnelInvertedDataY,
      type: 'scatter',
      line: {
        color: '#17BECF'
      }
    })

    this.elevationData.data.push({
      x: rectDataX,
      y: rectDataY,
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

  getFinalPointY(mRect:number, Xfinal:number, Xinitial:number, Yinitial:number): number {

    // Return the result of final point y of rect

    return (mRect * (Xfinal - Xinitial)) + Yinitial;
  }

  fresnelRadio(lambda: number, d1: number, d2: number): number {
    return Math.sqrt((lambda*d1*d2)/(d1 + d2));
  }

  getXTranferredPoint(xInitial: number, distance: number, angle: number): number {
    return xInitial + distance * Math.cos(angle);
  }

  getYTranferredPoint(yInitial: number, distance: number, angle: number): number {
    return yInitial + distance * Math.sin(angle);
  }

  createElipseData(distance1: number, 
                   distance2: number) {

    // console.log('DISTANCIA 1 ', distance1)
    // console.log('DISTANCIA 2 ', distance2)

    this.distance1 = distance1;
    this.distance2 = distance2;

    let distanceFraction = (distance2 - distance1) / this.pointsFraction;
    let distanceInitial = 0;

    console.log('DISTANCIA fraccionada ', distanceFraction)

    for (let index = 0; index < this.pointsFraction; index++) {
      
      // this.distance1 = index;
      this.distance2 = distance2 - this.distance1;

      let radio = this.fresnelRadio(this.lambda, distanceInitial, this.distance2);

      // console.log("Radio de frresnel ", radio)

      this.dataFresnelx.push(this.distance1);
      this.dataFresnely.push(radio + this.distanceFraction);
      // this.dataFresnely.push(radio + 1000);
      // this.dataFresnely.push(-radio);
      this.dataFresnelyInverted.push(-radio + this.distanceFraction);
      // this.dataFresnelyInverted.push(-radio + 1000);

      // Check if there are obstruction points

      if (this.dataFresnely[index] <= this.elevationTotalDataY[index]) {

        this.obstructionPointsX.push(this.elevationTotalDataX[index]);
        this.obstructionPointsY.push(radio + this.distanceFraction);
        
      }

      if (this.dataFresnelyInverted[index] <= this.elevationTotalDataY[index]) {
        this.obstructionPointsInvertedX.push(this.elevationTotalDataX[index]);
        this.obstructionPointsInvertedY.push(-radio + this.distanceFraction);
      }
      
      this.distance1 += distanceFraction;
      distanceInitial += distanceFraction;
    }

    console.log("Obstruction points array x ", this.obstructionPointsX)
    console.log("Obstruction points array y ", this.obstructionPointsY)

    // Added the final point of elipse

    this.dataFresnelx.push(this.distance1);
    this.dataFresnely.push(1000);
    this.dataFresnelyInverted.push(1000);

    this.elevationData.data.push({
      x: this.dataFresnelx,
      y: this.dataFresnely,
      type: 'scatter',
      line: {
        color: '#17BECF'
      }
    })

    this.elevationData.data.push({
      x: this.dataFresnelx,
      y: this.dataFresnelyInverted,
      type: 'scatter',
      line: {
        color: '#17BECF'
      }
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

    console.log("arreglo puntos de fresnel x ", this.dataFresnelx);
    console.log("arreglo puntos de fresnel y ", this.dataFresnely);
    console.log("arreglo puntos de fresnel negativos y ", this.dataFresnelyInverted);

    // 383 es el primer punto de obstruccion
    // El numero que corresponde con la obstruccion en 
    // la el arreglo de fresnel es

    // valor altura fresnel en 383 = 1120.9378943751108
    // valor altura elevacion en 383 = 1151

    // valor x fresnel en 383 = 152.5282295963755
    // valor x elevacion en 383 = 131.5481834148379


    this.loadingCtrl.dismiss();

  }

  async presentActionSheet(lat: number, long: number, e) {

    const actionSheet = await this.actionSheetController.create({
      header: 'ACCIONES',
      buttons: [
        { 
          text: 'Colocar marcador en: ' + lat + ", " + long,
          icon: 'location-outline',
          handler: () => {
            // this.setMarker(e);
          }
        },
      ],
    });

    await actionSheet.present();
  }

  openConfiguration() {
    this.menu.open('first');
  }

}

