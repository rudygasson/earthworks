import { ukToWorld } from "./grid";
import { assert } from "./utils";

const url = new URL("http://localhost:5000/earthworks");
const areaLayers = {}

export async function getAreaCollection() {
    return fetch(url + "/areas?q=table")
        .then(res => res.json());
}

// Get geoJson-Layer for an area
export async function getAreaLayer(area) {
    if (areaLayers[area]) return areaLayers[area];
    let dueData = await getGeoData({next_pi: "due", area});
    // let allData = await dueData.concat(await getGeoData({area, next_pi: "overdue"}));
    areaLayers[area] = L.geoJson(dueData, { coordsToLatLng: ukToWorld });
    return areaLayers[area];
}

export async function getGeoData(
    conditions = {
        "next_pi": "due",
        "area": 10
    }) {
    assert(typeof url === "object", url);
    assert(url.pathname === "/earthworks", url);
    Object.keys(conditions).forEach(key => {
        url.searchParams.set(key, conditions[key])
    });
    return fetch(url).then(res => res.json())
}
