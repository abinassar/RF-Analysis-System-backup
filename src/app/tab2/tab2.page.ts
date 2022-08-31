import { Component } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, MenuController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { SettingsService } from '../services/settings.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  lambda: number = 200;
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

  anthenaOneHeight: number = 1000;
  anthenaTwoHeight: number = 1000;

  constructor( private dataService: DataService,
               private loadingCtrl: LoadingController,
               private actionSheetController: ActionSheetController,
               private menu: MenuController,
               private settingsService: SettingsService ) {}

  ngOnInit(): void {

    this.settingsService.linkSettings$.subscribe((settings) => {

      this.anthenaOneHeight = settings.anthenaOneHigh;
      this.anthenaTwoHeight = settings.anthenaTwoHigh;

      this.presentLoading();

      setTimeout(() => {
        
        // Clean the before fresnel zone
  
        this.elevationData.data.pop();
        this.elevationData.data.pop();
        this.elevationData.data.pop();
        this.elevationData.data.pop();
        this.elevationData.data.pop();
  
  
        // Refresh data in graph
  
        this.createElipseCurve(this.elevationTotalDataX[0], 
                              this.anthenaOneHeight, 
                              this.elevationTotalDataX[this.elevationData.data[0].x.length - 1], 
                              this.anthenaTwoHeight,
                              2000);
                             
        this.loadingCtrl.dismiss();
        
      }, 2000);

    })

    // this.createElipseCurve(0, 0, 4, 4);

    // console.log("Actan ", Math.atan(1))

    this.presentLoading();

    this.getFresnelZoneData(40.851445, -3.360259, 40.852399, -3.364143);
    
  }

  ngAfterViewInit() {
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando data de elevación...'
    });

    loading.present();
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

    let distanceInKM = distance/1000;

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

  getFresnelZoneData (lat1: number,
                      lon1: number,
                      lat2: number,
                      lon2: number) {
                        
    let bearing = this.getBearing(lat1, lon1, lat2, lon2);

    let totalDistanceKM = this.getDistanceBetweenPoints(lat1, lon1, lat2, lon2)/1000;
    let totalDistanceMeters = this.getDistanceBetweenPoints(lat1, lon1, lat2, lon2);

    this.createLatLonData(lat1, lon1, lat2, totalDistanceMeters, bearing);
  }

  createLatLonData(lat1: number, 
                   lon1: number, 
                   lat2: number,
                   totalDistance: number, 
                   bearing:number,
                   distanceFraction: number = 1000) {

    console.log('distancia total ', totalDistance)

    // Divide the data in fraction of 1000 parts

    this.distanceFraction = distanceFraction;
                    
    //TODO Review this distance unity
    let distanceFractioned = totalDistance/distanceFraction;
    this.distanceFractioned = distanceFractioned;

    let finalPointDistance = distanceFractioned;

    this.elevationDataX = [];
    this.elevationDataY = [];

    let latlonArray = [];
    this.requestArray = [];
    let latPoint = lat1;
    let lonPoint = lon1;
    let latlonInitial = lat1 + ',' + lon1;

    latlonArray.push(latlonInitial);

    // Generate 10 pack of 100 requests

    for (let index = 0; index < 20; index++) {

      if (index !== 0) {
        latlonArray = [];
      }
      
      for (let index = 0; index < 100; index++) {

        if (index === 0 && this.firstIteration) {
          this.firstIteration = false;
          continue;
        }
       
        let latlonFinal = this.getLatLonInAnyDistance(latPoint,
                                                      lonPoint,
                                                      lat2,
                                                      finalPointDistance,
                                                      bearing);
  
        // Increase final point 
        finalPointDistance += distanceFractioned;
  
        latlonArray.push(latlonFinal.join(','));
  
        latPoint = latlonFinal[0]; // Final lat point
        lonPoint = latlonFinal[1]; // Final lon point
        
      }
  
      let uriBase = 'https://api.open-elevation.com/api/v1/lookup?locations=';
      let uriLocations = latlonArray.join('|');
  
      // console.log('lat lon array data ', latlonArray);
      // console.log('API uri ', latlonArray.join('|'));

      this.requestArray.push(this.dataService
                       .get(uriBase + uriLocations));
  
    }

    // Made the 10 reqeust and set the lat lon data

    let requestIndex = 0;

    this.requestArray[requestIndex].subscribe((response: any) => {
      
      this.responsesData.push(response);
      requestIndex += 1;

      this.requestRecursive(requestIndex);
    })

  }

  setElevationData(responsesData: any) {

    let totalResponsesData: any = [];

    responsesData.forEach((response: any) => {
      totalResponsesData = [...totalResponsesData , ...response.results];
    });

    // Set offset to initial point

    let distanceFinal = this.distanceFractioned;

    // Get point x and y for each position in map

    for (let index = 0; index < this.distanceFraction; index++) {
      
      this.elevationDataX.push(distanceFinal);
      this.elevationDataY.push(totalResponsesData[index].elevation);

      distanceFinal += this.distanceFractioned;
    }

    // Set floor in data

    let floorDataXInitial: number[] = [];
    let floorDataXFinal: number[] = [];
    let floorDataYInitial: number[] = [];
    let floorDataYFinal: number[] = [];

    let fractionIn200XInitial = this.elevationDataX[0];
    
    let initialPoint = 0;
    let finalPoint = this.elevationDataX[this.elevationDataX.length - 1];

    this.elevationTotalDataX = [];
    this.elevationTotalDataY = [];

    this.elevationTotalDataX = floorDataXInitial.concat(this.elevationDataX, floorDataXFinal);
    this.elevationTotalDataY = floorDataYInitial.concat(this.elevationDataY, floorDataYFinal);

    this.elevationData = {
      data: [
        { x: this.elevationTotalDataX,
          y: this.elevationTotalDataY,
          type: 'scatter'
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

    // this.createElipseCurve(this.elevationTotalDataX[99], 
    //                        1000, 
    //                        this.elevationTotalDataX[this.elevationData.data[0].x.length - 101], 
    //                        1000,
    //                        1000);

    this.createElipseCurve(this.elevationTotalDataX[0], 
                           this.anthenaOneHeight, 
                           this.elevationTotalDataX[this.elevationData.data[0].x.length - 1], 
                           this.anthenaTwoHeight,
                           2000);
                           
    this.elevationGraph = true;
    this.loadingCtrl.dismiss();
  }

  createElipseCurve(Xinitial: number, 
                    Yinitial: number, 
                    Xfinal: number, 
                    Yfinal: number,
                    fraction: number = 1000) {

    // console.log("Xinitial ", Xinitial)
    // console.log("Xfinal ", Xfinal)
    // console.log("Yinitial ", Yinitial)
    // console.log("Yfinal ", Yfinal)

    let diferenceX = Math.abs(Xfinal - Xinitial);
    let diferenceY = Math.abs(Yfinal - Yinitial);

    // console.log("Diferencia puntos x ", diferenceX);
    // console.log("Diferencia puntos y ", diferenceY);

    let rectDistance = Math.sqrt(Math.pow(diferenceX, 2) + Math.pow(diferenceY, 2));

    // console.log('distancia de la recta ', rectDistance);

    let xFractioned = Math.abs(Xfinal - Xinitial)/fraction;

    let mRect = (Yfinal - Yinitial)/(Xfinal - Xinitial);
    let angleRectDegree;

    // console.log("pendiente de la recta ", mRect)

    if (mRect === 0) {
      angleRectDegree = 0;
    } else {
      angleRectDegree = Math.atan(mRect);
    }

    // console.log("angulo de la recta en grados", angleRectDegree)

    let angleRectRadian = (angleRectDegree*Math.PI)/180;

    let angleClkSenseTransferred = angleRectRadian + Math.PI/2;
    let angleCounterClkSenseTransferred = angleRectRadian - Math.PI/2;

    if (angleClkSenseTransferred < 0) {
      angleClkSenseTransferred += 2*Math.PI;
    }

    if (angleCounterClkSenseTransferred < 0) {
      angleCounterClkSenseTransferred += 2*Math.PI;
    }

    console.log("Angulo de la recta ", angleRectRadian)

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

    this.elevationTotalDataY.forEach((y, index) => {

      // Busco un punto que este mas o menos en el valor de x de la zona de fresnel
      
      let indexOfPositionX = fresnelDataX.findIndex((fresnelPointX) => {
        return (fresnelPointX > this.elevationTotalDataX[index] - distanceFraction 
               && fresnelPointX < this.elevationTotalDataX[index] + distanceFraction);
      });

      if (y >= fresnelDataY[indexOfPositionX]) {

        this.obstructionPointsX.push(fresnelDataX[indexOfPositionX]);
        this.obstructionPointsY.push(fresnelDataY[indexOfPositionX]);

      }

      let indexOfPositionInvertedX = fresnelInvertedDataX.findIndex((fresnelPointX) => {
        return (fresnelPointX > this.elevationTotalDataX[index] - distanceFraction 
               && fresnelPointX < this.elevationTotalDataX[index] + distanceFraction);
      });

      if (y >= fresnelInvertedDataY[indexOfPositionInvertedX]) {
        
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

  requestRecursive(requestIndex: number) {

    if (requestIndex < this.requestArray.length) {

      this.requestArray[requestIndex].subscribe((response: any) => {

        requestIndex += 1;
        this.responsesData.push(response);

        if (this.responsesData.length === 10) {
          this.setElevationData(this.responsesData);
        }
  
        this.requestRecursive(requestIndex);

      })
    }

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

    let distanceFraction = (distance2 - distance1) / 1000;
    let distanceInitial = 0;

    console.log('DISTANCIA fraccionada ', distanceFraction)

    for (let index = 0; index < 1000; index++) {
      
      // this.distance1 = index;
      this.distance2 = distance2 - this.distance1;

      let radio = this.fresnelRadio(this.lambda, distanceInitial, this.distance2);

      // console.log("Radio de frresnel ", radio)

      this.dataFresnelx.push(this.distance1);
      this.dataFresnely.push(radio + 1000);
      // this.dataFresnely.push(-radio);
      this.dataFresnelyInverted.push(-radio + 1000);

      // Check if there are obstruction points

      if (this.dataFresnely[index] <= this.elevationTotalDataY[index]) {

        this.obstructionPointsX.push(this.elevationTotalDataX[index]);
        this.obstructionPointsY.push(radio + 1000);
        
      }

      if (this.dataFresnelyInverted[index] <= this.elevationTotalDataY[index]) {
        this.obstructionPointsInvertedX.push(this.elevationTotalDataX[index]);
        this.obstructionPointsInvertedY.push(-radio + 1000);
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
