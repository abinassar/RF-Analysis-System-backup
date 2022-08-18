import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { DataService } from '../services/data.service';

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

  constructor( private dataService: DataService,
               private alertController: AlertController ) {}

  ngOnInit(): void {

    this.presentAlert();

    this.getFresnelZoneData(40.851445, -3.360259, 40.852399, -3.364143);
    
  }

  ngAfterViewInit() {
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Espera',
      subHeader: 'Cargando la data de elevacio.'
    });

    await alert.present();
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

    const δ = distance/R;

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

    this.createLatLonData(lat1, lon1, lat2, totalDistanceKM, bearing);
  }

  createLatLonData(lat1: number, 
                   lon1: number, 
                   lat2: number,
                   totalDistance: number, 
                   bearing:number,
                   distanceFraction: number = 1000) {

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

    for (let index = 0; index < 10; index++) {

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

    console.log('distance fractioned ', this.distanceFractioned)
    console.log('distance fraction ', this.distanceFraction)
    console.log('Tottal responses data ', totalResponsesData)

    // Set offset to initial point

    let distanceFinal = this.distanceFractioned*100;

    // Get point x and y for each position in map

    for (let index = 0; index < this.distanceFraction; index++) {
      
      this.elevationDataX.push(distanceFinal*1000);
      this.elevationDataY.push(totalResponsesData[index].elevation);

      distanceFinal += this.distanceFractioned;
    }

    console.log('elevation data X ', this.elevationDataX);
    console.log('elevation data Y ', this.elevationDataY);

    // Set floor in data

    let floorDataXInitial: number[] = [];
    let floorDataXFinal: number[] = [];
    let floorDataYInitial: number[] = [];
    let floorDataYFinal: number[] = [];

    let fractionIn200XInitial = this.elevationDataX[0]/100;
    
    let initialPoint = 0;
    let finalPoint = this.elevationDataX[this.elevationDataX.length - 1];

    for (let index = 0; index < 100; index++) {

      floorDataXInitial.push(initialPoint);
      floorDataYInitial.push(this.elevationDataY[0]);

      floorDataXFinal.push(finalPoint);
      floorDataYFinal.push(this.elevationDataY[this.elevationDataY.length - 1]);

      initialPoint += fractionIn200XInitial;
      finalPoint += fractionIn200XInitial;
      
    }

    this.elevationTotalDataX = [];
    this.elevationTotalDataY = [];

    console.log("initial x data ", floorDataXInitial);

    this.elevationTotalDataX = floorDataXInitial.concat(this.elevationDataX, floorDataXFinal);
    this.elevationTotalDataY = floorDataYInitial.concat(this.elevationDataY, floorDataYFinal);

    console.log("elevation x ", this.elevationTotalDataX)
    console.log("elevation y ", this.elevationTotalDataY)

    this.elevationData = {
      // data: [
      //   { x: this.elevationDataX,
      //     y: this.elevationDataY,
      //     type: 'scatter'
      //   },
      // ],
      data: [
        { x: this.elevationTotalDataX,
          y: this.elevationTotalDataY,
          type: 'scatter'
        },
      ],
      layout: { title: 'Elevation graph' }
    };


    // console.log('final point ', this.elevationDataX[this.elevationData.data[0].x.length - 1])

    // this.createElipseData(0,this.elevationDataX[this.elevationData.data[0].x.length - 50]);
    
    console.log('final point ', this.elevationTotalDataX[this.elevationData.data[0].x.length - 1])

    this.createElipseData(this.elevationTotalDataX[99],
                          this.elevationTotalDataX[this.elevationData.data[0].x.length - 101] - this.elevationTotalDataX[99]);

    this.elevationGraph = true;
    this.alertController.dismiss();
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

  createElipseData(distance1: number, 
                   distance2: number) {

    // console.log('DISTANCIA 1 ', distance1)
    // console.log('DISTANCIA 2 ', distance2)

    this.distance1 = distance1;
    this.distance2 = distance2;

    let distanceFraction = (distance2 - distance1) / 4500;
    let distanceInitial = 0;

    console.log('DISTANCIA fraccionada ', distanceFraction)

    for (let index = 0; index < 4500; index++) {
      
      // this.distance1 = index;
      this.distance2 = distance2 - this.distance1;

      if (index > 4000) {
        console.log("distancia initial ", distanceInitial)
        console.log("distancia final ", this.distance2)
      }

      let radio = this.fresnelRadio(this.lambda, distanceInitial, this.distance2);

      // console.log("Radio de frresnel ", radio)

      this.dataFresnelx.push(this.distance1);
      this.dataFresnely.push(radio + 1000);
      // this.dataFresnely.push(-radio);
      this.dataFresnelyInverted.push(-radio + 1000);
      this.distance1 += distanceFraction;
      distanceInitial += distanceFraction;
    }

    // Added the final point of elipse

    this.dataFresnelx.push(this.distance1);
    this.dataFresnely.push(1000);
    this.dataFresnelyInverted.push(1000);

    this.elevationData.data.push({
      x: this.dataFresnelx,
      y: this.dataFresnely,
      type: 'scatter'
    })

    this.elevationData.data.push({
      x: this.dataFresnelx,
      y: this.dataFresnelyInverted,
      type: 'scatter',
      colorway: "#1f77b4"
    })

    console.log("arreglo puntos de fresnel x ", this.dataFresnelx);
    console.log("arreglo puntos de fresnel y ", this.dataFresnely);
    console.log("arreglo puntos de fresnel negativos y ", this.dataFresnelyInverted);


    this.alertController.dismiss();

  }

}
