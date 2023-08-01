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
    gain: number;
    name: string;
}