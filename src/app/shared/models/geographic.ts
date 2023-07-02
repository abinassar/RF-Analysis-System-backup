
export interface GeoPoint {
    lat: number;
    lng: number;
}

export const defaultPoints: GeoPoint = {
    lat: 0,
    lng: 0
}

export interface ElevationData {
    elevations: number[];
    linkDistance: number;
}