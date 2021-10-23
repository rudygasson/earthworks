import "leaflet";
import { latLngToENString } from "./grid";
import { getDetails } from "./connection";

const OSM_TILE_LAYER = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = `© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`;
const ATTRIBUTION = ` | Adam Carins & <a href="https://rudygasson.de">Rudy Gasson</a>`;
const CENTRE_OF_ENGLAND = { lat: 52.561928, lng: -1.464854 };
const DEFAULT_ZOOM = 7;
const DETAIL_ZOOM = 13;
const ZOOM_DELTA = 0.25;

export function initMap() {
    const mymap = L.map('mapdiv', {
        center: CENTRE_OF_ENGLAND,
        zoom: DEFAULT_ZOOM,
        zoomSnap: ZOOM_DELTA,
        zoomDelta: ZOOM_DELTA
    });
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

        table.appendChild(row);
    });
}

export function showDetails(event) {
    let map = event.target._map;
    if (map.getZoom() < DETAIL_ZOOM) map.flyTo(event.latlng, DETAIL_ZOOM);
    let feature = getDetails(event.layer.feature.properties.earthwork_number);
    let popup = event.target.getPopup();
    let view = {
        "earthwork_number": "ID:",
        "earthwork_type": "Type:",
        "earthwork_length_m": "Length (m):",
        "road": "Road:",
        "last_complete_inspection_date": "Last Insp.:",
        "next_principal_inspection_date": "Next Insp.:"
    };
    let tbody = document.createElement('tbody');
    let td = "<td style='padding: 0 0.2rem'>"
    feature.then(f => {
        for (let key of Object.keys(view)) {
            let tr = "<tr>" + td + view[key] + "</td>" + td + f.properties[key].toString() + "</td></tr>";
            tbody.innerHTML += tr;
        }
        popup.setContent(tbody);
        popup.update();
    });
}

export { CENTRE_OF_ENGLAND, DEFAULT_ZOOM }
