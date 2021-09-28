import { initMap, updateMapInfo, createTable } from "./display";
import { initActions } from "./actions";
import { assert } from "./utils";

const base_url = new URL("http://localhost:5000/earthworks");
const activeLayerGroup = L.layerGroup([]);

document.onreadystatechange = async function () {
    if (document.readyState === 'complete') {
        let areas = await getAreaCollection();
        assert(areas.length > 0, areas, "No area data available");
        let inspectionMap = initMap();
        updateMapInfo(inspectionMap);
        initActions(inspectionMap);
        console.log(areas);
        createTable(areas);
    }
}

async function getAreaCollection() {
    return fetch(base_url + "/areas?q=table")
        .then(res => res.json());
}


async function getGeoData(url,
    conditions = {
        "area": 10,
        "road": "M6",
        "next_pi": "overdue"
    }) {
    assert(typeof url === "object", url);
    assert(url.pathname === "/earthworks", url);
    Object.keys(conditions).forEach(key => {
        url.searchParams.set(key, conditions[key])
    });
    return fetch(url).then(res => res.json())
}
