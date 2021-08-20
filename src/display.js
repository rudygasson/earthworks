import "leaflet";
import { ukToWorld, latLngToENString } from "./grid";
import { allConditions } from "./filter";
import { assert } from "./utils";


const OSM_TILE_LAYER = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = `© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`;
const ATTRIBUTION = ` | Adam Carins & <a href="https://rudygasson.de">Rudy Gasson</a>`;
const CENTRE_OF_ENGLAND = { lat: 52.561928, lng: -1.464854 };
const DEFAULT_ZOOM = 7;

export function initMap() {
    const mymap = L.map('mapdiv', { center: CENTRE_OF_ENGLAND, zoom: DEFAULT_ZOOM });
    const lyrOSM = L.tileLayer(OSM_TILE_LAYER, { attribution: OSM_ATTRIBUTION + ATTRIBUTION });
    mymap.addLayer(lyrOSM);
    return mymap;
};

export function updateMapInfo(map, position) {
    assert(position.lat !== undefined && position.lng !== undefined, position)
    document.getElementById("mouse-location")
        .innerText = latLngToENString(position);
    document.getElementById("map-centre")
        .innerText = latLngToENString(map.getCenter());
    document.getElementById("zoom-level")
        .innerText = map.getZoom();
}

function description(layer) {
    let geo = layer.feature.geometry;
    let props = layer.feature.properties;
    return `${props.earthwork_length_m}m ${props.earthwork_type}</br> 
    at [${geo.coordinates[0]}, ${geo.coordinates[1]}]`;
}

export function createAllAreaLayers(data, areaNumbers) {
    let areaLayers = {};
    areaNumbers.map(area => areaLayers[area] = createAreaLayer(area));
    return areaLayers;

    function createAreaLayer(area) {
        assert(typeof area === "number", area);
        return L.geoJson(data,
            {
                filter: allConditions({ area_dbfo: (x) => x === area }),
                coordsToLatLng: ukToWorld
            });
    }
}

export function showArea(map, activeLayerGroup, areaLayer) {
    activeLayerGroup.clearLayers();
    activeLayerGroup.addLayer(areaLayer);
    return map.fitBounds(areaLayer.getBounds());
}

export { CENTRE_OF_ENGLAND, DEFAULT_ZOOM }
