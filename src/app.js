document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        initMap();
    }
}

const conditions = {
    road: (x) => x === "M6",
    earthwork_length_m: (x) => x > 300,
}
function meetsAllConditions(feature) {
    return Object.keys(conditions)
        .every(key => conditions[key](feature.properties[key]));
}

const geoData = fetch('data/NWinspectionreqWGS84.geojson')
    .then(res => res.json())
    .then(data => {
        let filtered = data.features.filter(meetsAllConditions);
        document.getElementById('data-points').innerHTML = filtered.length;
        return data;
    });

function initMap() {
    let mrkCurrentLocation;
    const mymap = L.map('mapdiv', { center: [52.561928, -1.464854], zoom: 7 });
    const lyrOSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
    mymap.addLayer(lyrOSM);

    function description(layer) {
        let props = layer.feature.properties;
        return props.earthwork_type + " " + props.earthwork_length_m + "m";
    }

    geoData.then(data => L.geoJSON(data, { filter: meetsAllConditions })
        .addTo(mymap)
        .bindPopup(description))

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
    
    mymap.on('zoomend', () => document.getElementById("zoom-level")
        .innerHTML = mymap.getZoom());

    mymap.on('moveend', () => {
        document.getElementById("map-centre")
            .innerHTML = LatLngToArrayString(mymap.getCenter());
        document.getElementById("zoom-level")
            .innerHTML = mymap.getZoom()
    });

    mymap.on('mousemove', (e) => document.getElementById("mouse-location")
        .innerHTML = LatLngToArrayString(e.latlng));

    document.getElementById("btnLocate").onclick = () => mymap.locate();

    document.getElementById("btnCentroid").onclick = () => {
        mymap.setView([52.561928, -1.464854], 7);
        mymap.openPopup(popCentroid);
    };
    function LatLngToArrayString(ll) {
        return "[" + ll.lat.toFixed(5) + ", " + ll.lng.toFixed(5) + "]";
    }
};
