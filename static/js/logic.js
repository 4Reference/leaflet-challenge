// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var platesUrl = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createMap function
  createMap(data.features);
});

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
function bindPopMaker(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
}
// from https://leafletjs.com/examples/choropleth/
function getColor(d) {
  return d > 6  ? '#800026' :
         d > 5  ? '#BD0026' :
         d > 4  ? '#E31A1C' :
         d > 3  ? '#FC4E2A' :
         d > 2  ? '#FD8D3C' :
         d > 1  ? '#FEB24C' :
         d > 0  ? '#FED976' :
                  '#FFEDA0';
}

function getSize(d) {
  return d * 5
}
function createMap(earthquakeData) {

  EarthquakeMarkers= earthquakeData.map((feature) =>
      L.circleMarker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], {
                    stroke: false,
                    color: getColor(feature.properties.mag),
                    fillColor: getColor(feature.properties.mag),
                    fillOpacity: 0.75,
                    radius: getSize(feature.properties.mag)
      })
      .bindPopup("<h2> Magnitude : " + feature.properties.mag +
      "</h2><hr><h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
  )      
  var earthquakes=L.layerGroup(EarthquakeMarkers)



  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

 var faultmap = L.tileLayer("https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json")

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the dark and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [darkmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  var legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
       var div = L.DomUtil.create('div', 'info legend'),
          magnitudes = [0, 1, 2, 3, 4, 5];
          magnitudes.forEach(magnitude => {
            let magRange = `${magnitude}-${magnitude+1}`;
            if (magnitude >= 5) { magRange = `${magnitude}+`}
            let html = `<div class="legend-item">
                    <div style="height: 25px; width: 35px; background-color:${getColor(magnitude)}"> </div>
                    <div class=legend-text>${magRange}</div>
                </div>`
            div.innerHTML += html
          })
          return div;
      };

  legend.addTo(myMap);
}
