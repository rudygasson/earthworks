import { showArea, updateMapInfo, CENTRE_OF_ENGLAND, DEFAULT_ZOOM } from "./display";
import { latLngToENString } from "./grid";

function initActions(map, activeLayerGroup, areaLayers) {
    map.doubleClickZoom.disable();
    map.on('mousemove', (e) => updateMapInfo(map, e.latlng));
    document.getElementById("area_selection")
        .addEventListener("change", (e) => showArea(map, activeLayerGroup, areaLayers[e.target.value]));

    const popCentroid = L.popup()
        .setLatLng(CENTRE_OF_ENGLAND)
        .setContent("<h2>Centre of England</h2>" + latLngToENString(CENTRE_OF_ENGLAND));

    document.getElementById("btnCentroid").onclick = () => {
        map.openPopup(popCentroid).setView(CENTRE_OF_ENGLAND, DEFAULT_ZOOM);
        updateMapInfo(map, map.getCenter());
    };
};

function initCurrentLocation(mymap) {
    document.getElementById("btnLocate").onclick = () => mymap.locate();
    mymap.on('keypress', (e) => {
        if (e.originalEvent.key == "l") {
            mymap.locate();
        }
    });
    mymap.on('locationfound', (e) => {
        console.log(e);
        if (mrkCurrentLocation) {
            mrkCurrentLocation.remove();
        }
        mrkCurrentLocation = L.circle(e.latlng, { radius: e.accuracy / 100 }).addTo(mymap);
        mymap.setView(e.latlng, 14);
    });
    mymap.on('locationerror', (e) => alert("location not found"));
};

export { initActions }
