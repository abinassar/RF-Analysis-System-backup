import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { GeoPoint, LinkSettings, defaultPoints } from '@shared/models';
import { AlertService, LocationService, SettingsService } from '@shared/services';
import { HomeService } from 'src/app/pages/home/home.service';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';

const SPEED_OF_LIGHT: number = 299792458;

@Component({
  selector: 'app-elevation-profile',
  templateUrl: './elevation-profile.component.html',
  styleUrls: ['./elevation-profile.component.scss'],
})
export class ElevationProfileComponent implements OnDestroy {

  lambda: number = SPEED_OF_LIGHT/(this.settingsService.linkSettings.antennaSelected.frecuency * 1e6);
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

  // Puntos de obstruccion de zona de fresnel 100%

  obstructionPointsX: number[] = [];
  obstructionPointsInvertedX: number[] = [];
  obstructionPointsY: number[] = [];
  obstructionPointsInvertedY: number[] = [];

  // Puntos de obstruccion de zona de fresnel 60%

  obstruction60PercentPointsX: number[] = [];
  obstruction60PercentPointsInvertedX: number[] = [];
  obstruction60PercentPointsY: number[] = [];
  obstruction60PercentPointsInvertedY: number[] = [];

  pointsFraction: number = 1000;

  settingsForm!: FormGroup;
  showForm: boolean = false;
  obstructionSelectedPoints: any[] = [];
  obstruction60PercentSelectedPoints: any[] = [];
  startUpperObstruction: boolean = false;
  startLowerObstruction: boolean = false;
  clearMap: boolean = false;
  showMap: boolean = false;
  obstructionFieldPoints: any[] = [];
  P1!: GeoPoint;
  P2!: GeoPoint;

  constructor(public settingsService: SettingsService,
              private locationService: LocationService,
              private alertService: AlertService,
              private loadingCtrl: LoadingController,
              public homeService: HomeService,
              private formBuilder: FormBuilder,
              private router: Router,
              private screenOrientation: ScreenOrientation) { }
  
  async ionViewWillEnter() {

    await this.homeService.getUserLinks();

    this.P1 = {...this.settingsService.linkSettings.P1};
    this.P2 = {...this.settingsService.linkSettings.P2};
    
    this.setSettingsForm();
    this.showForm = true;
    
    this.P1 = {...this.settingsService.linkSettings.P1};
    this.P2 = {...this.settingsService.linkSettings.P2};
    
    this.showMap = true;
    this.settingsService.showTabs = true;
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

  }

  showFullScreenMap() {
    this.showMap = false;
    setTimeout(() => {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
      this.router.navigate([`/home/map`]);
    }, 100);
  }

  showFullScreenGraphic() {
    localStorage.setItem("graphic-data", JSON.stringify(this.elevationData.data));
    localStorage.setItem("graphic-layout", JSON.stringify(this.elevationData.layout));
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    this.router.navigate([`/home/graphic`]);
  }

  setSettingsForm() {

    this.settingsForm = this.formBuilder.group({
      antennaInitialHeight: this.formBuilder.control(this.settingsService.linkSettings.antennaOneHeight === 0 ? null : this.settingsService.linkSettings.antennaOneHeight, Validators.required),
      antennaFinalHeight: this.formBuilder.control(this.settingsService.linkSettings.antennaTwoHeight === 0 ? null : this.settingsService.linkSettings.antennaTwoHeight, Validators.required)
    });

  };

  saveLinkSettings() {

    
    if (this.settingsForm.valid) {
      
      this.alertService.showLoading("Guardando datos del enlace...");

      const linkSettings: LinkSettings = {
        P1: this.settingsService.linkSettings.P1,
        P2: this.settingsService.linkSettings.P2,
        antennaOneHeight: this.settingsForm?.get("antennaInitialHeight")?.value,
        antennaTwoHeight: this.settingsForm?.get("antennaFinalHeight")?.value,
        antennaSelected: this.settingsService.linkSettings.antennaSelected,
        atmosphericPressure: this.settingsService.linkSettings.atmosphericPressure,
        temperature: this.settingsService.linkSettings.temperature,
        waterDensity: this.settingsService.linkSettings.waterDensity,
        linkName: this.settingsService.linkSettings.linkName,
        selected: true
      }

      this.settingsService
          .SetUserLinkSettingsData(this.homeService.getUserId, [linkSettings])
          .subscribe((response: any) => {

            this.alertService.closeLoading();

          },
          (error: any) => {
            this.alertService.closeLoading();
            this.alertService.presentAlert("Hubo un problema guadrando la configuracion",
                                           "Por favor, intenta mas tarde")
          });

    } else {

      this.settingsForm.markAllAsTouched();
      this.alertService
          .presentAlert("Salvar configuración", 
                        "Por favor completa los datos para poder guardar los datos del enlace");

    }

  }
  
  generateElevationGraph() {

    if (this.settingsService.linkSettings.P1 !== defaultPoints
        && this.settingsService.linkSettings.P2 !== defaultPoints) {

      this.getElevationProfile();

    } else {

      this.elevationGraph = false;

      this.alertService
          .presentAlert("Puntos geográficos", 
                        "Por favor selecciona dos puntos en el mapa para mostrar la gráfica");

    }

  }

  getBearingRobot(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const lat1Rad = lat1 * Math.PI / 180; // latitud del punto A en radianes
    const lat2Rad = lat2 * Math.PI / 180; // latitud del punto B en radianes
    const dLon = (lon2 - lon1) * Math.PI / 180; // diferencia de longitud en radianes
  
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
    const bearingRad = Math.atan2(y, x); // bearing en radianes
    const bearingDeg = bearingRad * 180 / Math.PI; // bearing en grados
  
    return (bearingDeg + 360) % 360; // ajuste de la dirección a un rango de 0 a 360 grados
  }

  getDestinationLatLong(lat1: number, lon1: number, bearing: number, distance: number): [number, number] {
    const R = 6371; // radio de la Tierra en km
    const d = distance / 1000; // distancia en km
    const lat1Rad = lat1 * Math.PI / 180; // latitud en radianes
    const lon1Rad = lon1 * Math.PI / 180; // longitud en radianes
    const bearingRad = bearing * Math.PI / 180; // dirección en radianes
  
    const lat2Rad = Math.asin(Math.sin(lat1Rad) * Math.cos(d/R) + Math.cos(lat1Rad) * Math.sin(d/R) * Math.cos(bearingRad));
    const lon2Rad = lon1Rad + Math.atan2(Math.sin(bearingRad) * Math.sin(d/R) * Math.cos(lat1Rad), Math.cos(d/R) - Math.sin(lat1Rad) * Math.sin(lat2Rad));
  
    const lat2 = lat2Rad * 180 / Math.PI; // latitud en grados
    const lon2 = lon2Rad * 180 / Math.PI; // longitud en grados
  
    return [lat2, lon2];
  }

  setObstructionPoints() {
    this.obstructionFieldPoints = [];
    let bearing = this.getBearingRobot(this.settingsService.linkSettings.P1.lat,
                                       this.settingsService.linkSettings.P1.lng,
                                       this.settingsService.linkSettings.P2.lat,
                                       this.settingsService.linkSettings.P2.lng);

    this.obstructionSelectedPoints.forEach((point) => {

      let finalPointCoordinates = this.getDestinationLatLong(this.settingsService.linkSettings.P1.lat,
                                                             this.settingsService.linkSettings.P1.lng,
                                                             bearing,
                                                             point.distance);

      let obstructionPointCoord = {
        distance: point.distance,
        elevation: point.elevation,
        lat: finalPointCoordinates[0],
        lng: finalPointCoordinates[1]
      };

      this.obstructionFieldPoints.push(obstructionPointCoord);

    });
    
  }
  
  showMapp() {
    console.log("home service show map ", this.homeService.showMap)
    console.log("this.obstructionSelectedPoints ", this.obstructionSelectedPoints)
  }

  deleteMap() {
    this.clearMap = true;
  }

  showObstructions() {
    console.log("this.obstructionSelectedPoints ", this.obstructionSelectedPoints)
  }

  resetElevationData() {
    this.elevationDataX = [];
    this.elevationDataY = [];
    this.elevationData.data = [];
  }

  async getElevationProfile() {

    const loading = await this.loadingCtrl.create({
      message: 'Cargando perfil de elevación...'
    });

    await loading.present();

    this.locationService
        .getElevationProfile(this.settingsService.linkSettings.P1, this.settingsService.linkSettings.P2)
        .subscribe((response) => {

      // Reset the elevation points
      // data arrays

      this.elevationDataX = [];
      this.elevationDataY = [];
      this.obstructionSelectedPoints = [];
      this.obstruction60PercentSelectedPoints = [];

      let distanceFraction = response.linkDistance*1000/this.pointsFraction;
      let positionX = 0;

      console.log("distanceFraction: ", distanceFraction)

      let elevationProfileData = response.elevations;
      this.settingsService.linkDistance = response.linkDistance;
  
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
          { 
            // name: 'Puntos de Elevacion',
            x: this.elevationDataX,
            y: this.elevationDataY,
            mode: 'lines+markers', // El modo de la serie de datos es "lines" y "markers"
            fill: 'tozeroy',
            opacity: 0.5,
            line: {              // Establecemos la configuracion de la linea
              shape: 'spline', // Configuramos la forma como "spline"
              color: '#afafaf', // Establecemos el color de la linea
              width: 1,
            },
            marker: {
              size: 2
            },
            showlegend: false
          },
        ],
        layout: { 
          // title: 'Gráfico de elevación',
          yaxis: {
            showline: false,
            showgrid: false,
            // title: 'Distancia (m)'
          },
          xaxis: {
            showline: false,
            showgrid: false,
            // title: 'Distancia (m)'
          },
          autosize: true,
          margin: {
            l: 40,
            r: 20,
            t: 20,
            b: 20
          }
        }
      };

      // Agregar la altura por defecto de la elevacion de la tierra
      // A la altura de la antena

      let antenaOneHeight = this.settingsService.linkSettings.antennaOneHeight;
      let antenaTwoHeight = this.settingsService.linkSettings.antennaTwoHeight;

      antenaOneHeight += this.elevationDataY[0];
      antenaTwoHeight += this.elevationDataY[this.elevationDataY.length - 1];

      this.createElipseCurve(this.elevationDataX[0], 
                            antenaOneHeight, 
                            this.elevationDataX[this.elevationData.data[0].x.length - 1], 
                            antenaTwoHeight,
                            this.pointsFraction);

      this.setObstructionPoints();
                                
      this.elevationGraph = true;
      this.loadingCtrl.dismiss();

    }, (error) => {
      
      this.loadingCtrl.dismiss();
      this.alertService
          .presentAlert("Error", 
          // "Ha ocurrido un error obteniendo la informacion, intente más tarde");
          JSON.stringify(error));

    })

  }

  getFresnelPoint(radio: number, 
                  P1x: number, 
                  P1y: number,
                  angleCounterClkSenseTransferred: number, 
                  angleClkSenseTransferred: number,
                  index: number,
                  fraction: number,
                  Xfinal: number,
                  Xinitial: number,
                  Yfinal: number,
                  Yinitial: number) {

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

    let fresnelPoint =  {
      fresnelPositiveXPoint,
      fresnelNegativeXPoint,
      fresnelPositiveYPoint,
      fresnelNegativeYPoint
    }

    return fresnelPoint;
    
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

    // Calculo distancia en x y y

    let diferenceX = Math.abs(Xfinal - Xinitial);
    let diferenceY = Math.abs(Yfinal - Yinitial);

    // console.log("Diferencia puntos x ", diferenceX);
    // console.log("Diferencia puntos y ", diferenceY);

    // Calculo el largo de la recta del elipse

    let rectDistance = Math.sqrt(Math.pow(diferenceX, 2) + Math.pow(diferenceY, 2));

    // Divido la distancia en fracciones de igual valor 
    // A las fracciones que se dividieron los puntos de elevacion

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

    // console.log("Angulo de la recta en radianes", angleRectRadian)

    // console.log("Angulo transladado ens entido de agujas del reloj ", angleClkSenseTransferred)
    // console.log("Angulo transladado ens entido contrario de agujas del reloj ", angleCounterClkSenseTransferred)

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

    // Calculo de la primera zona de fresnel

    const fresnelPoints = this.createFresnelPoints(1,
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

    this.elevationData.data.push(
      {
        x: fresnelPoints.fresnelDataX,
        y: fresnelPoints.fresnelDataY,
        type: 'scatter',
        line: {
          color: '#17BECF'
        },
        // name: 'zona de fresnel inferior',
        showlegend: false
      },
      {
        x: fresnelPoints.fresnelInvertedDataX,
        y: fresnelPoints.fresnelInvertedDataY,
        type: 'scatter',
        line: {
          color: '#17BECF'
        },
        // name: 'zona de fresnel superior',
        showlegend: false
      },
      {
        x: fresnelPoints.fresnelData60PercentX,
        y: fresnelPoints.fresnelData60PercentY,
        type: 'scatter',
        line: {
          color: '#9a37c4'
        },
        // name: 'zona de fresnel 60% inferior',
        showlegend: false
      },
      {
        x: fresnelPoints.fresnelInvertedData60PercentX,
        y: fresnelPoints.fresnelInvertedData60PercentY,
        type: 'scatter',
        line: {
          color: '#9a37c4'
        },
        // name: 'zona de fresnel 60% superior',
        showlegend: false
      },
    
    );

    this.elevationData.data.push(
      {
        x: this.obstructionPointsX,
        y: this.obstructionPointsY,
        mode: 'markers',
        type: 'scatter',
        opacity: 0.8,
        line: {
          color: '#d91313'
        },
        // name: 'puntos de obstruccion inferior'
        showlegend: false
      },
      {
        x: this.obstructionPointsInvertedX,
        y: this.obstructionPointsInvertedY,
        mode: 'markers',
        type: 'scatter',
        opacity: 0.8,
        line: {
          color: '#d91313'
        },
        // name: 'puntos de obstruccion superior'
        showlegend: false
      },
    );

    this.elevationGraph = true;

  }

  createFresnelPoints(radioPercent = 1,
                      fraction: any, 
                      rectDataX: any, 
                      rectDataY: any, 
                      P1x: any, 
                      P1y: any, 
                      distance1: any, 
                      distance2: any, 
                      angleCounterClkSenseTransferred: any, 
                      angleClkSenseTransferred: any,
                      Xfinal: any,
                      Yfinal: any,
                      Xinitial: any,
                      Yinitial: any,
                      fresnelDataX: any,
                      fresnelDataY: any,
                      fresnelInvertedDataX: any,
                      fresnelInvertedDataY: any,
                      mRect: any,
                      xFractioned: any,
                      distanceFraction: any) {

    let fresnelData60PercentX: any = [];
    let fresnelInvertedData60PercentX: any = [];

    let fresnelData60PercentY: any = [];
    let fresnelInvertedData60PercentY: any = [];

    for (let index = 0; index <= fraction; index++) {
      
      // Add point to rect data
        
      rectDataX.push(P1x);
      rectDataY.push(P1y);

      // Create the fresnel zone points

      let radio = radioPercent * this.fresnelRadio(this.lambda, distance1, distance2);
      let sixteenPercentRadio = 0.6 * this.fresnelRadio(this.lambda, distance1, distance2);

      if (radio < 0.00001) {
        radio = 0;
      }

      const fresnelPoint = this.getFresnelPoint(radio, 
                                                P1x, 
                                                P1y,
                                                angleCounterClkSenseTransferred, 
                                                angleClkSenseTransferred,
                                                index,
                                                fraction,
                                                Xfinal,
                                                Xinitial,
                                                Yfinal,
                                                Yinitial);

      const fresnel60PercentPoint = this.getFresnelPoint(sixteenPercentRadio, 
                                                         P1x, 
                                                         P1y,
                                                         angleCounterClkSenseTransferred, 
                                                         angleClkSenseTransferred,
                                                         index,
                                                         fraction,
                                                         Xfinal,
                                                         Xinitial,
                                                         Yfinal,
                                                         Yinitial);

      // Agrego punto de zona de fresnel a 60 porciento

      fresnelData60PercentX.push(fresnel60PercentPoint.fresnelPositiveXPoint);
      fresnelInvertedData60PercentX.push(fresnel60PercentPoint.fresnelNegativeXPoint);

      fresnelData60PercentY.push(fresnel60PercentPoint.fresnelPositiveYPoint);
      fresnelInvertedData60PercentY.push(fresnel60PercentPoint.fresnelNegativeYPoint);

      // Agrego puntos a 100 porciento

      fresnelDataX.push(fresnelPoint.fresnelPositiveXPoint);
      fresnelInvertedDataX.push(fresnelPoint.fresnelNegativeXPoint);

      fresnelDataY.push(fresnelPoint.fresnelPositiveYPoint);
      fresnelInvertedDataY.push(fresnelPoint.fresnelNegativeYPoint);

      P1y = this.getFinalPointY(mRect, (P1x + xFractioned), P1x, P1y);
      P1x += xFractioned;

      // // Update the distance 1 and distance 2 to next loop
  
      distance1 += distanceFraction;
      distance2 = Math.abs(distance2 - distanceFraction);

    }


    // Busoc puntos de obstruccion en 60 porciento de zona d efresnel

    this.elevationDataY.forEach((elevationProfilePointY, index) => {

      // Busco un punto que este mas o menos en el valor de x de la zona de fresnel
      
      let indexOfPositionX = fresnelData60PercentX.findIndex((fresnelPointX: any) => {
        return (fresnelPointX > this.elevationDataX[index] - distanceFraction 
               && fresnelPointX < this.elevationDataX[index] + distanceFraction);
      });

      if (elevationProfilePointY >= fresnelData60PercentY[indexOfPositionX]) {

        if (!this.startLowerObstruction) {

          this.startLowerObstruction = true;

          // I check that the point does not exist so as not to add again

          let pointExist = this.obstructionSelectedPoints.findIndex((point) => {
            return point.distance === fresnelData60PercentX[indexOfPositionX]
          });

          if (pointExist === -1) {
            this.obstructionSelectedPoints.push({
              distance: fresnelData60PercentX[indexOfPositionX],
              elevation: fresnelData60PercentY[indexOfPositionX]
            });
          }
        }

        this.obstructionPointsX.push(fresnelData60PercentX[indexOfPositionX]);
        this.obstructionPointsY.push(fresnelData60PercentY[indexOfPositionX]);

      } else {

        this.startLowerObstruction = false;

      }

      let indexOfPositionInvertedX = fresnelInvertedData60PercentX.findIndex((fresnelPointX: any) => {
        return (fresnelPointX > this.elevationDataX[index] - distanceFraction 
               && fresnelPointX < this.elevationDataX[index] + distanceFraction);
      });

      if (elevationProfilePointY >= fresnelInvertedData60PercentY[indexOfPositionInvertedX]) {

        if (!this.startUpperObstruction) {

          this.startUpperObstruction = true;

          // I check that the point does not exist so as not to add again

          let pointExist = this.obstructionSelectedPoints.findIndex((point) => {
            return point.distance === fresnelInvertedData60PercentX[indexOfPositionX]
          });

          if (pointExist === -1) {
            this.obstructionSelectedPoints.push({
              distance: fresnelInvertedData60PercentX[indexOfPositionX],
              elevation: fresnelInvertedData60PercentY[indexOfPositionX]
            });
          }

        }
        
        this.obstructionPointsInvertedX.push(fresnelInvertedData60PercentX[indexOfPositionInvertedX]);
        this.obstructionPointsInvertedY.push(fresnelInvertedData60PercentY[indexOfPositionInvertedX]);

      } else {
        this.startUpperObstruction = false;
      }

    });

    let fresnelPoints = {
      fresnelDataX,
      fresnelDataY,
      fresnelInvertedDataX,
      fresnelInvertedDataY,
      rectDataX,
      rectDataY,
      fresnelData60PercentX,
      fresnelData60PercentY,
      fresnelInvertedData60PercentX,
      fresnelInvertedData60PercentY
    }

    return fresnelPoints;

  }

  showObs() {
    console.log("obstruction60PercentPointsX ", this.obstruction60PercentPointsX)
    console.log("obstruction60PercentPointsY ", this.obstruction60PercentPointsY)
    console.log("obstructionPointsInvertedX ", this.obstructionPointsInvertedX)
    console.log("obstructionPointsInvertedY ", this.obstructionPointsInvertedY)
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

  interpolateArray(arr: any) {
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
    // return Math.sqrt((lambda*d1*d2)/(d1 + d2));

    // Convierto lambda a frecuencia
    // Nota: la frecuecnia debe estar en Ghz

    // let frecuency = SPEED_OF_LIGHT/lambda;
    // Uso frecuencia de 20 Ghz
    let frecuency = 20;

    return 17.32 * Math.sqrt((d1 * d2)/((d1 + d2) * frecuency));

  }

  ngOnDestroy(): void {
    // console.log("deleting map")
      // this.deleteMap();
  }

}
