import proj4 from "proj4";
import "leaflet";

let getAPIData = async function (resource) {
  let url = `http://127.0.0.1:5000/${resource}`;
  let APIData = fetch(url).then((res) => res.json());
  return APIData;
};

let area = 10;
// const GEOJSON_URL = "data/A56_EPSG27700.json";
// const CONDITIONS = {
//   road: (x) => x === "A56",
//   earthwork_length_m: (x) => x > 0,
// };
const UK_GRID_ID = "urn:ogc:def:crs:EPSG::27700";
const UK_GRID_TRANSFORM =
  "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs";
const WORLD_GRID_ID = "WGS84";
const CENTRE_OF_ENGLAND = [52.561928, -1.464854];
const DEFAULT_ZOOM = 7;
proj4.defs(UK_GRID_ID, UK_GRID_TRANSFORM);

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    initMap();
  }
};

function allConditions(conditions) {
  return (feature) =>
    Object.keys(conditions).every((key) =>
      conditions[key](feature.properties[key])
    );
}

function ukToWorld(coords) {
  let converted = proj4(UK_GRID_ID, WORLD_GRID_ID, coords);
  return L.latLng(converted[1], converted[0]);
}

function worldToUk(coords) {
  let converted = proj4(WORLD_GRID_ID, UK_GRID_ID, [coords[1], coords[0]]);
  return [Math.round(converted[0]), Math.round(converted[1])];
}

function LatLngToENString({ lat, lng }) {
  let [easting, northing] = worldToUk([lat, lng]);
  return `[${easting}, ${northing}]`;
}

async function getGeoData(geoJsonUrl) {
  return fetch(geoJsonUrl)
    .then((res) => res.json())
    .then((data) => {
      let filtered = data.features.filter(allConditions(CONDITIONS));
      document.getElementById("data-points").innerText = filtered.length;
      return filtered;
    });
}

function updateMapLegend(position, map) {
  document.getElementById("mouse-location").innerText =
    LatLngToENString(position);
  document.getElementById("map-centre").innerText = LatLngToENString(
    map.getCenter()
  );
  document.getElementById("zoom-level").innerText = map.getZoom();
}

async function initMap() {
  let mrkCurrentLocation;
  const mymap = L.map("mapdiv", {
    center: CENTRE_OF_ENGLAND,
    zoom: DEFAULT_ZOOM,
  });
  const lyrOSM = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png");
  mymap.addLayer(lyrOSM);
  updateMapLegend(mymap.getCenter(), mymap);

  function description(layer) {
    let geo = layer.feature.geometry;
    let props = layer.feature.properties;
    return `${props.earthwork_length_m}m ${props.earthwork_type}</br> 
        at [${geo.coordinates[0]}, ${geo.coordinates[1]}]`;
  }

  let resource = `/earthworks/inspectionreq/?area_dbfo=${area}`;
  let geoData = await getAPIData(resource);
  const dataLayer = L.geoJSON(geoData, { coordsToLatLng: ukToWorld });
  //   const dataLayer = L.geoJson([], {
  //     filter: allConditions(CONDITIONS),
  //     coordsToLatLng: ukToWorld,
  //   });

  const dropdown = document.getElementById("area_selection");
  dropdown.addEventListener("click", function () {
    area = dropdown.options[dropdown.selectedIndex].value;
    console.log(area);
  });

  dataLayer.addData(geoData).bindPopup(description);

  mymap.addLayer(dataLayer);
  const popCentroid = L.popup();
  popCentroid.setLatLng(CENTRE_OF_ENGLAND);
  popCentroid.setContent(
    "<h2>Centre of England</h2>" + LatLngToENString(popCentroid.getLatLng())
  );

  mymap.doubleClickZoom.disable();

  mymap.on("dblclick", (e) => {
    L.marker(e.latlng)
      .addTo(mymap)
      .bindPopup(`${LatLngToENString(e.latlng)}<br>${new Date()}`);
  });

  mymap.on("keypress", (e) => {
    if (e.originalEvent.key == "l") {
      mymap.locate();
    }
  });

  mymap.on("locationfound", (e) => {
    console.log(e);
    if (mrkCurrentLocation) {
      mrkCurrentLocation.remove();
    }
    mrkCurrentLocation = L.circle(e.latlng, { radius: e.accuracy / 100 }).addTo(
      mymap
    );
    mymap.setView(e.latlng, 14);
  });

  mymap.on("locationerror", (e) => alert("location not found"));

  mymap.on("mousemove", (e) => updateMapLegend(e.latlng, mymap));

  document.getElementById("btnLocate").onclick = () => mymap.locate();

  document.getElementById("btnCentroid").onclick = () => {
    mymap.openPopup(popCentroid).setView(CENTRE_OF_ENGLAND, DEFAULT_ZOOM);
    updateMapLegend(mymap.getCenter(), mymap);
  };
}
