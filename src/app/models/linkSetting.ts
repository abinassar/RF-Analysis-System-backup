export interface linkSetting {
    anthenaOneHeight: number;
    anthenaTwoHeight: number;
    P1: pointCoordinate;
    P2: pointCoordinate;  
}

export interface pointCoordinate {
    Latitude: number;
    Longitude: number;
}

export const pointDefaultCoordinate: pointCoordinate = {
    Latitude: 0,
    Longitude: 0
}

export const defaultLinkSettings: linkSetting = {
    anthenaOneHeight: 0,
    anthenaTwoHeight: 0,
    P1: pointDefaultCoordinate,
    P2: pointDefaultCoordinate
}

