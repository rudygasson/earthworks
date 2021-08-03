import { allConditions } from "./filter";
import { initMap, createAllAreaLayers, updateMapInfo } from "./display";
import { initActions } from "./actions";

const GEOJSON_URL = 'data/A56_EPSG27700.json'
const activeLayerGroup = L.layerGroup([]);

document.onreadystatechange = async function () {
    if (document.readyState === 'complete') {
        let geoData = await getGeoData(GEOJSON_URL);
        let inspectionMap = initMap();
        let areaLayers = createAllAreaLayers(geoData, [10, 13]);
        updateMapInfo(inspectionMap, inspectionMap.getCenter());
        activeLayerGroup.addTo(inspectionMap);
        initActions(inspectionMap, activeLayerGroup, areaLayers);
    }
}

async function getGeoData(geoJsonUrl, conditions = {}) {
    return fetch(geoJsonUrl)
        .then(res => res.json())
        .then(data => {
            let filtered = data.features.filter(allConditions(conditions));
            document.getElementsByClassName('due')[0].innerText = filtered.length;
            return filtered;
        });
}
