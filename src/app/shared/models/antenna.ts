import { GeoPoint, defaultPoints } from "./geographic";

export interface Antenna {
    name: string;
    txAntennaGain: number;
    frecuency: number;
    maxDistanceKm: string;
    imgPath: string;
    checked: boolean;
}

export interface AntennaSelected {
    frecuency: number;
    name: string;
    txPower: number;
    txAntennaGain: number;
    txLoss: number;
    freeSpaceLoss: number;
    miscLoss: number;
    rxAntennaGain: number;
    rxLoss: number;
}

export const defaultAntenna: AntennaSelected = {
    frecuency: 0,
    name: "Antena por defecto",
    txPower: 0,
    txAntennaGain: 0,
    txLoss: 0,
    freeSpaceLoss: 0,
    miscLoss: 0,
    rxAntennaGain: 0,
    rxLoss: 0
}

export interface LinkSettings {
    P1: GeoPoint;
    P2: GeoPoint;
    antennaOneHeight: number;
    antennaTwoHeight: number;
    atmosphericPressure: number;
    temperature: number;
    waterDensity: number;
    antennaSelected: AntennaSelected;
    linkName: string;
    selected: boolean;
}

export const defaultLinkSettings: LinkSettings = {
    P1: defaultPoints,
    P2: defaultPoints,
    antennaOneHeight: 0,
    antennaTwoHeight: 0,
    atmosphericPressure: 0,
    temperature: 0,
    waterDensity: 0,
    antennaSelected: defaultAntenna,
    linkName: "Mi primer enlace",
    selected: true
}

export const antennasList: Antenna[] = [
    {
      name: "UBIQUITI AIRMAX U-OMT-DISH-5",
      txAntennaGain: 27,
      frecuency: 5,
      maxDistanceKm: "5 Km",
      imgPath: "../../../assets/images/antennas/UBIQUITI AIRMAX U-OMT-DISH-5.png",
      checked: false
    },
    {
      name: "Ubiquiti airFiber 60 LR",
      txAntennaGain: 38,
      frecuency: 60,
      maxDistanceKm: "15 Km",
      imgPath: "../../../assets/images/antennas/Ubiquiti airFiber 60 LR.png",
      checked: false
    },   
    {
      name: "Ubiquiti airFiber 60 XR",
      txAntennaGain: 26,
      frecuency: 60,
      maxDistanceKm: "15 Km",
      imgPath: "../../../assets/images/antennas/Ubiquiti airFiber 60 XR.png",
      checked: false
    },   
    {
      name: "Ubiquiti airFiber 60 XG",
      txAntennaGain: 43,
      frecuency: 60,
      maxDistanceKm: "4 Km",
      imgPath: "../../../assets/images/antennas/Ubiquiti airFiber 60 XG.png",
      checked: false
    }, 
    {
      name: "Ubiquiti airFiber 60 HD",
      txAntennaGain: 35,
      frecuency: 60,
      maxDistanceKm: "2 Km",
      imgPath: "../../../assets/images/antennas/Ubiquiti airFiber 60 HD.png",
      checked: false
    },    
    {
      name: "Ubiquiti GigaBeam",
      txAntennaGain: 38,
      frecuency: 60,
      maxDistanceKm: "2 Km",
      imgPath: "../../../assets/images/antennas/Ubiquiti GigaBeam.png",
      checked: false
    },   
    {
      name: "Ubiquiti AirFiber 24",
      txAntennaGain: 33,
      frecuency: 24.1,
      maxDistanceKm: "13 Km",
      imgPath: "../../../assets/images/antennas/Ubiquiti AirFiber 24 - 1.png",
      checked: false
    },     
    {
      name: "Ubiquiti AirFiber 24 HD",
      txAntennaGain: 33,
      frecuency: 24.05,
      maxDistanceKm: "20 Km",
      imgPath: "../../../assets/images/antennas/Ubiquiti AirFiber 24 HD - 1.png",
      checked: false
    },  
    {
      name: "Ubiquiti Powerbeam PBE 5AC-620",
      txAntennaGain: 29,
      frecuency: 5,
      maxDistanceKm: "30 Km",
      imgPath: "../../../assets/images/antennas/Ubiquiti Powerbeam PBE 5AC-620.png",
      checked: false
    },  
    {
      name: "Ubiquiti PowerBeam AC PBE-5AC-300",
      txAntennaGain: 22,
      frecuency: 5,
      maxDistanceKm: "30 Km",
      imgPath: "../../../assets/images/antennas/Ubiquiti PowerBeam AC PBE-5AC-300.png",
      checked: false
    }, 
    {
      name: "Ubiquiti PowerBeam AC PBE-5AC-400",
      txAntennaGain: 25,
      frecuency: 5,
      maxDistanceKm: "30 Km",
      imgPath: "../../../assets/images/antennas/Ubiquiti PowerBeam AC PBE-5AC-400.png",
      checked: false
    },     // {
    //   name: "AIRMAX U-OMT-DISH-5 2",
    //   imgPath: "https://www.crsl.es/9909-large_default/ubiquiti-airmax-u-omt-dish-5-antena-dish-de-5ghz-de-27dbi-con-soporte.jpg",
    //   efficiency: 27,
    //   frecuency: 5,
    //   wavelength: 5,
    //   gain: 5,
    //   checked: false
    // }
];