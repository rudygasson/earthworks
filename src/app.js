// import * as L from "leaflet";
import proj4 from "proj4";
import "proj4leaflet";

const GEOJSON_URL = 'data/A56_EPSG27700.json'
const CONDITIONS = {
    road: (x) => x === "A56",
    earthwork_length_m: (x) => x > 0
}

document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        initMap();
    }
}

function allConditions(conditions) {
    return (feature) => Object.keys(conditions)
        .every(key => conditions[key](feature.properties[key]));
}

async function getGeoData(geoJsonUrl) {
    return fetch(geoJsonUrl)
        .then(res => res.json())
        .then(data => {
            let filtered = data.features.filter(allConditions(CONDITIONS));
            document.getElementById('data-points').innerHTML = filtered.length;
            console.log(data);
            return data;
        })
}

async function initMap() {
    let mrkCurrentLocation;
    const mymap = L.map('mapdiv', { center: [52.561928, -1.464854], zoom: 7 });
    const lyrOSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
    mymap.addLayer(lyrOSM);

    function description(layer) {
        let props = layer.feature.properties;
        return props.earthwork_type + " " + props.earthwork_length_m + "m";
    }

    proj4.defs(
        "urn:ogc:def:crs:EPSG::27700",
        "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs"
    );

    L.Proj.geoJson(await getGeoData(GEOJSON_URL), { filter: allConditions(CONDITIONS) })
        .addTo(mymap)
        .bindPopup(description);

    const popCentroid = L.popup();
    popCentroid.setLatLng([52.561928, -1.464854]);
    popCentroid.setContent("<h2>Centre of England</h2>");

    mymap.doubleClickZoom.disable();

    mymap.on('dblclick', (e) => {
        var dtCurrentTime = new Date();
        L.marker(e.latlng).addTo(mymap).bindPopup(e.latlng.toString() + "<br>" + dtCurrentTime.toString());
    });

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

    mymap.on('mousemove', (e) => {
        document.getElementById("mouse-location")
            .innerHTML = LatLngToArrayString(e.latlng);
        document.getElementById("map-centre")
            .innerHTML = LatLngToArrayString(mymap.getCenter());
        document.getElementById("zoom-level")
            .innerHTML = mymap.getZoom();
    });

    document.getElementById("btnLocate").onclick = () => mymap.locate();

    document.getElementById("btnCentroid").onclick = () => {
        mymap.setView([52.561928, -1.464854], 7);
        mymap.openPopup(popCentroid);
    };
    function LatLngToArrayString(ll) {
        return "[" + ll.lat.toFixed(5) + ", " + ll.lng.toFixed(5) + "]";
    }
};
