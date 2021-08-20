import { allConditions } from "./filter";
import { initMap, createAllAreaLayers, updateMapInfo } from "./display";
import { initActions } from "./actions";
import { assert } from "./utils";

const GEOJSON_URL = new URL('http://localhost:5000/earthworks');
const activeLayerGroup = L.layerGroup([]);

document.onreadystatechange = async function () {
    if (document.readyState === 'complete') {
        let geoData = await getGeoData(GEOJSON_URL);
        assert(geoData !== {}, geoData);
        let inspectionMap = initMap();
        let areaLayers = createAllAreaLayers(geoData, [10, 13]);
        updateMapInfo(inspectionMap, inspectionMap.getCenter());
        activeLayerGroup.addTo(inspectionMap);
        initActions(inspectionMap, activeLayerGroup, areaLayers);
    }
}

async function getGeoData(geoJsonUrl, conditions = {}) {
    assert(typeof geoJsonUrl === "object", geoJsonUrl);
    assert(geoJsonUrl.pathname === "/earthworks", geoJsonUrl);
    return fetch(geoJsonUrl)
        .then(res => res.json())
        .then(data => {
            assert(data.features !== undefined && data.features !== [], data);
            let filtered = data.features.filter(allConditions(conditions));
            document.getElementsByClassName('due')[0].innerText = filtered.length;
            return filtered;
        });
}
