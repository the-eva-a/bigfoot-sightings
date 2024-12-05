// Initialize bf as an empty array to hold the JSON data
let bf = []; 

// Fetch the JSON file and load the data
fetch('http://localhost:8080/static/data/bigfoot_coordinates_clean_cols.json')
  .then(response => response.json()) // Parse the JSON data
  .then(data => {
    bf = data; // Assign the data to bf

    // Array to store bfMarkers
    let classAMarkers = [];
    let classBMarkers = [];

    // Function to update the map based on class selection
    function optionChanged(classType) {
      // Clear all existing markers
      myMap.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
          myMap.removeLayer(layer);
        }
      });

      // Add selected class markers
      if (classType === "A") {
        classAMarkers.forEach(marker => marker.addTo(myMap));
      } else if (classType === "B") {
        classBMarkers.forEach(marker => marker.addTo(myMap));
      }
    };

    // Loop through all the 'Class A' bigfoot entries to find coordinates 
    bf.forEach(entry => {
      if (entry.report_class === "A") {
        classAMarkers.push(
          L.marker([entry.latitude, entry.longitude])
        );
      }
    });

    // Loop through all the 'Class B' bigfoot entries to get coordinates
    bf.forEach(entry => {
      if (entry.report_class === "B") {
        classBMarkers.push(
          L.marker([entry.latitude, entry.longitude])
        );
      }
    });

    // Make Class A and B layers
    let classALayer = L.layerGroup(classAMarkers);
    let classBLayer = L.layerGroup(classBMarkers);

    // Define variables for tile layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Only one base layer can be shown at a time.
    let baseMaps = {
      Street: street,
      Topography: topo
    };

    // Overlays that can be toggled on or off
    let overlayMaps = {
      classA: classALayer,
      classB: classBLayer
    };

    // Map object centered around North America
    let myMap = L.map("map", {
      center: [48.5, -98.5],
      zoom: 4,
      layers: [street, classALayer]
    });

    // Pass our map layers into our layer control
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
  })
  .catch(error => console.log('Error loading JSON data:', error)); 

