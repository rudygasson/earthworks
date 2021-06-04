const conditions = {
    // road: (x) => x === "M6",
    earthwork_length_m: (x) => x > 0,
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

(function initApp() {
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

    // mymap.on('contextmenu', function (e) {
    //     var dtCurrentTime = new Date();
    //     L.marker(e.latlng).addTo(mymap).bindPopup(e.latlng.toString() + "<br>" + dtCurrentTime.toString());
    // });
    mymap.on('keypress', function (e) {
        if (e.originalEvent.key == "l") {
            mymap.locate();
        }
    });
    mymap.on('locationfound', function (e) {
        console.log(e);
        if (mrkCurrentLocation) {
            mrkCurrentLocation.remove();
        }
        mrkCurrentLocation = L.circle(e.latlng, { radius: e.accuracy / 100 }).addTo(mymap);
        mymap.setView(e.latlng, 14);
    });
    mymap.on('locationerror', function (e) {
        console.log(e);
        alert("location not found");
    });
    // mymap.on('zoomend', function () {
    //     $("#zoom-level").html(mymap.getZoom())
    // });
    // mymap.on('moveend', function () {
    //     $("#map-centre").html(LatLngToArrayString(mymap.getCenter()));
    // });
    // mymap.on('mousemove', function (e) {
    //     $("#mouse-location").html(LatLngToArrayString(e.latlng));
    // });
    // $("#btnLocate").on("click", function (e) {
    //     mymap.locate();
    // });
    // $("#btnCentroid").on("click", function (e) {
    //     mymap.setView([52.561928, -1.464854], 7);
    //     mymap.openPopup(popCentroid);
    // });
    function LatLngToArrayString(ll) {
        return "[" + ll.lat.toFixed(5) + ", " + ll.lng.toFixed(5) + "]";
    }
})();
