import proj4 from "proj4";

const UK_GRID_ID = 'urn:ogc:def:crs:EPSG::27700';
const UK_GRID_TRANSFORM = '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs';
const WORLD_GRID_ID = 'WGS84';

proj4.defs(UK_GRID_ID, UK_GRID_TRANSFORM);

export function ukToWorld(coords) {
    let converted = proj4(UK_GRID_ID, WORLD_GRID_ID, coords);
    return L.latLng(converted[1], converted[0]);
}

export function worldToUk(coords) {
    let converted = proj4(WORLD_GRID_ID, UK_GRID_ID, [coords[1], coords[0]]);
    return [Math.round(converted[0]), Math.round(converted[1])];
}

export function latLngToENString({ lat, lng }) {
    let [easting, northing] = worldToUk([lat, lng]);
    return `[${easting}, ${northing}]`;
}
