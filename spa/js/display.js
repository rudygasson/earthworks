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

export function updateMapInfo(map, position = map.getCenter()) {
    document.getElementById("mouse-location")
        .innerText = latLngToENString(position);
    document.getElementById("map-centre")
        .innerText = latLngToENString(map.getCenter());
    document.getElementById("zoom-level")
        .innerText = map.getZoom();
}

export function createTable(areaData) {
    let table = document.querySelector("#area-table tbody");
    areaData.forEach((area, index) => {
        let dueCount = document.createTextNode(area.due.count || "");
        let dueLength = document.createTextNode(area.due.length_km || "");
        let overdueCount = document.createTextNode(area.overdue.count || "");
        let overdueLength = document.createTextNode(area.overdue.length_km || "");

        let row = document.createElement("tr");
        let col = document.createElement("td");

        col.appendChild(document.createTextNode(area.id));
        row.appendChild(col);

        col = document.createElement("td");
        col.appendChild(dueCount);
        row.appendChild(col);

        col = document.createElement("td");
        col.appendChild(dueLength);
        row.appendChild(col);

        col = document.createElement("td");
        col.appendChild(overdueCount);
        row.appendChild(col);

        col = document.createElement("td");
        col.appendChild(overdueLength);
        row.appendChild(col);

        row.addEventListener("click",
            e => showArea(e.target.parentElement.firstChild.textContent),
            false);
        table.appendChild(row);
    });
}

function description(layer) {
    let geo = layer.feature.geometry;
    let props = layer.feature.properties;
    return `${props.earthwork_length_m}m ${props.earthwork_type}</br>
    at [${geo.coordinates[0]}, ${geo.coordinates[1]}]`;
}

export function createAllAreaLayers(data, areaNumbers) {
    let areaLayers = {};
    areaNumbers.map(area => areaLayers[area] = createAreaLayer(area, data));
    return areaLayers;
}

function createAreaLayer(area, data) {
    assert(typeof area === "number", area);
    return L.geoJson(data,
        {
            filter: allConditions({ area_dbfo: (x) => x === area }),
            coordsToLatLng: ukToWorld
        });
}

export function showArea(areaNumber) {
    console.warn(areaNumber);
}

// export function showArea(map, activeLayerGroup, areaLayer) {
//     console.log(map);
//     activeLayerGroup.clearLayers();
//     activeLayerGroup.addLayer(areaLayer);
//     return map.fitBounds(areaLayer.getBounds());
// }

export { CENTRE_OF_ENGLAND, DEFAULT_ZOOM }
