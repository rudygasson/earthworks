import { getAreaCollection } from "./connection";
import { initMap, updateMapInfo, createTable } from "./display";
import { initActions } from "./actions";
import { assert } from "./utils";

document.onreadystatechange = async function () {
    if (document.readyState === 'complete') {
        let areas = await getAreaCollection();
        assert(areas.length > 0, areas, "No area data available");
        let iMap = initMap();
        updateMapInfo(iMap);
        initActions(iMap);
        createTable(areas);
    }
}
