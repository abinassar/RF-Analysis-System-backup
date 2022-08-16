import { Component } from '@angular/core';
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
  datax: number[] = [];
  datay: number[] = [];
  datayInverted: number[] = [];
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

  constructor( private dataService: DataService ) {}

  ngOnInit(): void {

    this.getFresnelZoneData(40.851445, -3.360259, 40.852399, -3.364143);

    // this.createElipseData();

    // this.graph = {
    //   data: [
    //     { x: this.datax,
    //       y: this.datay,
    //       type: 'scatter'},
    //     {
    //       x: this.datax,
    //       y: this.datayInverted
    //     },
    //     {
    //       x: [-10, 1010],
    //       y: [-10, -10]
    //     },
    //   ],
    //   layout: {width: 800, 
    //            height: 400, 
    //            title: 'A Fancy Plot'}
    // };

    // this.graph.data[0].y.push(this.datayInverted);
    
  }

  ngAfterViewInit() {
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

    // // ‘projected’ latitude difference

    // const Δφ = δ * Math.cos(bearing);
    // let lat2 = lat1Radian + Δφ;

    // const Δψ = Math.log(Math.tan(lat2/2+Math.PI/4)/Math.tan(lat1Radian/2+Math.PI/4));
    // const q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(lat1Radian); // E-W course becomes ill-conditioned with 0/0

    // const Δλ = δ*Math.sin(bearing)/q;
    // const lon2 = lon1Radian + Δλ;

    const latFinal2 = Math.asin( Math.sin(lat1Radian)*Math.cos(δ) +
                      Math.cos(lat1Radian)*Math.sin(δ)*Math.cos(bearingRadian) );
    const lonFinal2 = lon1Radian + Math.atan2(Math.sin(bearingRadian)*Math.sin(δ)*Math.cos(lat1Radian),
                              Math.cos(δ)-Math.sin(lat1Radian)*Math.sin(lat2Radian));

    
    // check for some daft bugger going past the pole, normalise latitude if so
    // if (Math.abs(lat2) > Math.PI/2) lat2 = lat2>0 ? Math.PI-lat2 : -Math.PI-lat2;

    // return [Number(latFinal2.toString().substr(0,9)),
    //   Number(lonFinal2.toString().substr(0,10))];
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

    // console.log('bearing entre dos puntos ', bearing);
    
    // console.log('distancia entre puntos ', totalDistanceKM);


    this.createLatLonData(lat1, lon1, lat2, totalDistanceKM, bearing);
  }

  createLatLonData(lat1: number, 
                   lon1: number, 
                   lat2: number,
                   totalDistance: number, 
                   bearing:number,
                   distanceFraction: number = 1000) {

    this.distanceFraction = distanceFraction;
                    
    let distanceFractioned = totalDistance/distanceFraction;
    this.distanceFractioned = distanceFractioned;

    let finalPointDistance = distanceFractioned;
    // console.log('distancia fraccionada ', distanceFractioned);

    this.elevationDataX = [];
    this.elevationDataY = [];

    let latlonArray = [];
    this.requestArray = [];
    let latPoint = lat1;
    let lonPoint = lon1;
    let latlonInitial = lat1 + ',' + lon1;

    latlonArray.push(latlonInitial);

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

    let distanceFinal = this.distanceFractioned;

    for (let index = 0; index < this.distanceFraction; index++) {
      
      this.elevationDataX.push(distanceFinal*1000);
      this.elevationDataY.push(totalResponsesData[index].elevation);

      distanceFinal += this.distanceFractioned;
    }

    console.log('elevation data X ', this.elevationDataX)
    console.log('elevation data Y ', this.elevationDataY)

    this.elevationData = {
      data: [
        { x: this.elevationDataX,
          y: this.elevationDataY,
          type: 'scatter'
        },
      ],
      layout: { title: 'Elevation graph' }
    };

    console.log('final point ', this.elevationDataX[this.elevationData.data[0].x.length - 1])

    this.createElipseData(0,this.elevationDataX[this.elevationData.data[0].x.length - 1]);

    this.elevationGraph = true;
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
    return Math.sqrt((this.lambda*this.distance1*this.distance2)/(this.distance1 + this.distance2));
  }

  createElipseData(distance1: number, distance2: number) {

    console.log('DISTANCIA 1 ', distance1)
    console.log('DISTANCIA 2 ', distance2)

    this.distance1 = distance1;
    this.distance2 = distance2;

    let distanceFraction = distance2 / 1000;

    console.log('DISTANCIA fraccionada ', distanceFraction)


    for (let index = 0; index <= 1000; index++) {
      
      // this.distance1 = index;
      this.distance2 = distance2 - this.distance1;

      let radio = this.fresnelRadio(this.lambda, this.distance1, this.distance2);

      this.datax.push(this.distance1);
      this.datay.push(radio + 1000);
      // this.datay.push(-radio);
      this.datayInverted.push(-radio + 1000);
      this.distance1 = this.distance1 + distanceFraction;
    }

    this.elevationData.data.push({
      x: this.datax,
      y: this.datay,
      type: 'scatter'
    })

    this.elevationData.data.push({
      x: this.datax,
      y: this.datayInverted,
      type: 'scatter',
      colorway: "#1f77b4"
    })

    console.log('data x ', this.datax)
    console.log('data y ', this.datay)

  }

}
