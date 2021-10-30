import { ukToWorld } from "./grid";
import { assert } from "./utils";
import { showDetails } from "./display";

export const BASE_URL = "http://localhost:5000/earthworks";
const DUE_COLOR = 'darkorange';
const OVERDUE_COLOR = 'red';
const LINE_WEIGHT = 8;
const areaLayers = {};

export async function getAreaCollection() {
    let url = new URL(BASE_URL);
    return fetch(url + "/areas?q=table")
        .then(res => res.json());
}

// Get geoJSON-Layer for an area
export async function getAreaLayer(area) {
    if (areaLayers[area]) return areaLayers[area];
    let dueData = await getGeoData({ next_pi: "due", area });
    let overdueData = await getGeoData({ next_pi: "overdue", area });
    overdueData.features.map(feature => {
        feature.properties.overdue = true;
    });
    areaLayers[area] = L.geoJson(dueData, {
        coordsToLatLng: ukToWorld,
        style: {
            color: DUE_COLOR,
            weight: LINE_WEIGHT
        }
    });
    areaLayers[area].addData(overdueData).eachLayer(layer => {
        if (layer.feature.properties.overdue) layer.options.color = OVERDUE_COLOR;
    });
    areaLayers[area].bindPopup("Loading...");
    areaLayers[area].on('click', showDetails);
    return areaLayers[area];
}

export async function getDetails(earthwork_number) {
    let url = new URL(BASE_URL);
    return fetch(url + `/${earthwork_number}`).then(res => res.json())
}

export async function getGeoData(
    conditions = {
        "next_pi": "due",
        "area": 10
    }) {
    let url = new URL(BASE_URL);
    assert(typeof url === "object", url);
    assert(url.pathname === "/earthworks", url);
    Object.keys(conditions).forEach(key => {
        url.searchParams.set(key, conditions[key])
    });
    return fetch(url).then(res => res.json())
}
