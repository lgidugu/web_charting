// We create the tile layers that will be the selectable backgrounds of our map.
// One for our grayscale background.
var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=" +
  "pk.eyJ1IjoibGdpZHVndSIsImEiOiJjamh2NDgwOHYwdmZqM3BwMGQyMnpwbDc4In0.t5PwkvNz9Qm5zWCaDfBb5g.T6YbdDixkOBWH_k9GbS8JQ", {
    attribution: "Map data &copy;" +
      "<a href='http://openstreetmap.org'>OpenStreetMap</a> contributors," +
      "<a href='http://creativecommons.org/licenses/by-sa/2.0/'>" +
      "CC-BY-SA</a>" +
      "Imagery &copy;" +
      "<a href='http://mapbox.com'>Mapbox</a>",
    maxZoom: 18
  });

// Another for our satellite background.
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoibGdpZHVndSIsImEiOiJjamh2NDgwOHYwdmZqM3BwMGQyMnpwbDc4In0.t5PwkvNz9Qm5zWCaDfBb5g.T6YbdDixkOBWH_k9GbS8JQ", {
    attribution: "Map data &copy;" +
      "<a href='http://openstreetmap.org'>OpenStreetMap</a> contributors," +
      "<a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>" +
      "Imagery &copy; <a href='http://mapbox.com'>Mapbox</a>",
    maxZoom: 18
  });

// One for our outdoors background.
var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoibGdpZHVndSIsImEiOiJjamh2NDgwOHYwdmZqM3BwMGQyMnpwbDc4In0.t5PwkvNz9Qm5zWCaDfBb5g.T6YbdDixkOBWH_k9GbS8JQ", {
    attribution: "Map data &copy;" +
      "<a href='http://openstreetmap.org'>OpenStreetMap</a> contributors," +
      "<a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>" +
      "Imagery &copy; <a href='http://mapbox.com'>Mapbox</a>",
    maxZoom: 18
  });

// We then create the map object with options. Adding the tile layers we just
// created to an array of layers.
var map = L.map("mapid", {
  center: [
    40.7, -94.5
  ],
  zoom: 3,
  layers: [graymap, satellitemap, outdoors]
});

// Adding our 'graymap' tile layer to the map.
graymap.addTo(map);

// We create the layers for our two different sets of data, earthquakes and
// tectonicplates.
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Defining an object that contains all of our different map choices. Only one
// of these maps will be visible at a time!
var baseMaps = {
  Satellite: satellitemap,
  Grayscale: graymap,
  Outdoors: outdoors
};

// We define an object that contains all of our overlays. Any combination of
// these overlays may be visible at the same time!
var overlays = {
  "Tectonic Plates": tectonicplates,
  Earthquakes: earthquakes
};

// Then we add a control to the map that will allow the user to change which
// layers are visible.
L
  .control
  .layers(baseMaps, overlays)
  .addTo(map);

// Our AJAX call retrieves our earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. We pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Determines the color of the marker based on the magnitude of the earthquake.
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#FFFF00";
      case magnitude > 4:
        return "#FFFF00";
      case magnitude > 3:
        return "#FFA500";
      case magnitude > 2:
        return "#FFC200";
      case magnitude > 1:
        return "#F0E68C";
      default:
        return "#00ff00";
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 2;
  }

  // Here we add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // We turn each feature into a circleMarker on the map.
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // We create a popup for each marker to display the magnitude and location of
    // the earthquake after the marker has been created and styled
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
    // We add the data to the earthquake layer instead of directly to the map.
  }).addTo(earthquakes);

  // Then we add the earthquake layer to our map.
  earthquakes.addTo(map);


 
   // Setting up the legend
   var legend = L.control({ position: "bottomright" });
   legend.onAdd = function() {
     var div = L.DomUtil.create("div", "info legend");
     var limits = [0,1,2,3,4,5];
     var colors = ["#00ff00","#F0E68C","#FFC200","#FFA500","#FFFF00", "#FFA500"]
  
     for (var i = 0; i < limits.length; i++) {
       div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
         limits[i] + (limits[i + 1] ? "&ndash;" + limits[i + 1] + "<br>" : "+");
     }
     return div;
   };
 
   // Adding legend to the map
   legend.addTo(map);
  
  // Here we make an AJAX call to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
      // Adding our geoJSON data, along with style information, to the tectonicplates
      // layer.
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonicplates);

      // Then add the tectonicplates layer to the map.
      tectonicplates.addTo(map);
    });
});
