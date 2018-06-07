var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
 console.log(data);
 // Once we get a response, send the data.features object to the createFeatures function
 createFeatures(data.features);
});

function createFeatures(earthquakeData) {

 // Define a function we want to run once for each feature in the features array
 // Give each feature a popup describing the place and time of the earthquake
 function onEachFeature(feature, layer) {
   layer.bindPopup("<h3>" + feature.properties.place +
     "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
 }

 //Create a GeoJSON layer containing the features array on the earthquakeData object
 //Run the onEachFeature function once for each piece of data in the array
 var earthquakes = L.geoJSON(earthquakeData, {
   onEachFeature: onEachFeature,
   pointToLayer: function(feature, latlng){
     return new L.circle(latlng,
     {radius: returnRadius(feature.properties.mag),
     fillColor: returnColor(feature.properties.mag),
     fillOpacity: .8,
     color: "black",
     stroke: true,
     weight: .8
     })
   }

});

 // Sending our earthquakes layer to the createMap function
 createMap(earthquakes);
}

function createMap(earthquakes) {

 // Define streetmap and darkmap layers
 var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
   "access_token=pk.eyJ1IjoibGdpZHVndSIsImEiOiJjamh2NDgwOHYwdmZqM3BwMGQyMnpwbDc4In0.t5PwkvNz9Qm5zWCaDfBb5g.BT5eVZ--H1Brz8O2_bgx3g");

 var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
   "access_token=pk.eyJ1IjoibGdpZHVndSIsImEiOiJjamh2NDgwOHYwdmZqM3BwMGQyMnpwbDc4In0.t5PwkvNz9Qm5zWCaDfBb5g.BT5eVZ--H1Brz8O2_bgx3g");

 // Define a baseMaps object to hold our base layers
 var baseMaps = {
   "Street Map": streetmap,
   "Dark Map": darkmap
 };

 // Create overlay object to hold our overlay layer
 var overlayMaps = {
   Earthquakes: earthquakes
 };

 // Create our map, giving it the streetmap and earthquakes layers to display on load
 var myMap = L.map("map", {
   center: [
     37.62, -122.38, //San Francisco, CA
   ],
   zoom: 5,
   layers: [streetmap, earthquakes]
 });

 // Create a layer control
 // Pass in our baseMaps and overlayMaps
 // Add the layer control to the map
 L.control.layers(baseMaps, overlayMaps, {
   collapsed: false
 }).addTo(myMap);



  // Setting up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0,1,2,3,4,5];
    var colors = ["#00ff00","#F0E68C","#FFC200","#FFA500","#FFFF00", "#FFA500"]
    var labels = [];

    // Add min & max
    var legendInfo = "<h3>Earthquake Magnitutde</h3>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);
};

function returnColor(magnitude){
    if ( magnitude >=5 ) {
      return "#FFA500" ;//red
      }  
      else if ( magnitude >=4) {
        return "#FFA500"; //orange
      }
      else if ( magnitude >=3) {
          return "#FFC200"; //amber
      }
      else if ( magnitude >=2) {
        return "#F0E68C"; //khaki
      } 
      else if (magnitude >=1){
        return "#FFFF00" //yellow
      }
      else {
          return "#00ff00" //green
      }
   }
        
   function returnRadius(magnitude) {
    return magnitude*10000;
   }
   