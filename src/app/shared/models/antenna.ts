import { GeoPoint, defaultPoints } from "./geographic";

export interface Antenna {
    name: string;
    gain: number;
    efficiency: number;
    frecuency: number;
    wavelength: number;
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
    linkName: string
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
    linkName: "Mi primer enlace"
}