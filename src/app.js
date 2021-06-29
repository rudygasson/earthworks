import proj4 from "proj4";
import "leaflet";

const GEOJSON_URL = 'data/A56_EPSG27700.json'
const CONDITIONS = {
    road: (x) => x === "A56",
    earthwork_length_m: (x) => x > 0
}

proj4.defs(
    "urn:ogc:def:crs:EPSG::27700",
    "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs"
);

document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        initMap();
    }
}

function allConditions(conditions) {
    return (feature) => Object.keys(conditions)
        .every(key => conditions[key](feature.properties[key]));
}

function bgsToWgs(coords) {
    let converted = proj4("urn:ogc:def:crs:EPSG::27700", "WGS84", coords);
    return L.latLng(converted[1], converted[0]);
}

function wgsToBgs(coords) {
    let converted = proj4("WGS84", "urn:ogc:def:crs:EPSG::27700", [coords[1], coords[0]]);
    return [Math.round(converted[0]), Math.round(converted[1])];
}

async function getGeoData(geoJsonUrl) {
    return fetch(geoJsonUrl)
        .then(res => res.json())
        .then(data => {
            let filtered = data.features.filter(allConditions(CONDITIONS));
            document.getElementById('data-points').innerText = filtered.length;
            return filtered;
        });
}

async function initMap() {
    let centreOfEngland = [52.561928, -1.464854];
    let mrkCurrentLocation;
    const mymap = L.map('mapdiv', { center: centreOfEngland, zoom: 7 });
    const lyrOSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
    mymap.addLayer(lyrOSM);

    function description(layer) {
        let geo = layer.feature.geometry;
        let props = layer.feature.properties;
        return `${props.earthwork_length_m}m ${props.earthwork_type}</br> 
        at [${geo.coordinates}]`;
    }

    let geoData = await getGeoData(GEOJSON_URL);

    const dataLayer = L.geoJson(geoData,
        {
            filter: allConditions(CONDITIONS),
            coordsToLatLng: bgsToWgs
        }
    ).bindPopup(description);

    console.log(dataLayer);
    mymap.addLayer(dataLayer);

    const popCentroid = L.popup();
    popCentroid.setLatLng(centreOfEngland);
    popCentroid.setContent("<h2>Centre of England</h2> at </br>" + wgsToBgs(centreOfEngland));

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
            .innerText = LatLngToArrayString(e.latlng);
        document.getElementById("map-centre")
            .innerText = LatLngToArrayString(mymap.getCenter());
        document.getElementById("zoom-level")
            .innerText = mymap.getZoom();
    });

    document.getElementById("btnLocate").onclick = () => mymap.locate();

    document.getElementById("btnCentroid").onclick = () => {
        mymap.openPopup(popCentroid).setView(centreOfEngland, 7);
    };
    function LatLngToArrayString(ll) {
        return "[" + ll.lat.toFixed(5) + ", " + ll.lng.toFixed(5) + "]";
    }
};
