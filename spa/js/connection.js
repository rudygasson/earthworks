import { ukToWorld } from "./grid";
import { assert } from "./utils";
import { merge } from '@mapbox/geojson-merge';
import { showDetails } from "./display";

export const BASE_URL = "http://localhost:5000/earthworks";
const areaLayers = {};

export async function getAreaCollection() {
    let url = new URL(BASE_URL);
    return fetch(url + "/areas?q=table")
        .then(res => res.json());
}

// Get geoJson-Layer for an area
export async function getAreaLayer(area) {
    if (areaLayers[area]) return areaLayers[area];
    let dueData = await getGeoData({ next_pi: "due", area });
    let overdueData = await getGeoData({ next_pi: "overdue", area });
    let allData = merge([...dueData.features, ...overdueData.features]);
    areaLayers[area] = L.geoJson(allData, {
        coordsToLatLng: ukToWorld,
        style: {
            color: 'darkorange',
            weight: 10
        }
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
