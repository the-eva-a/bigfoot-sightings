// Initialize the map
const map = L.map('map').setView([39.8283, -98.5795], 4); // Center of the US

// Add a tile layer (map background)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a new marker cluster group.
let markerClusters = L.markerClusterGroup();

// Initialize an object that contains icons for each class.
let icons = {
  classA: L.ExtraMarkers.icon({
      icon: "extra-marker-star-yellow", 
      iconColor: "white",
      markerColor: "yellow",
      shape: "star"
  }),
  classB: L.ExtraMarkers.icon({
      icon: "extra-marker-circle-red",
      iconColor: "white",
      markerColor: "red",
      shape: "circle"
  }),
  classC: L.ExtraMarkers.icon({
      icon: "extra-marker-penta-blue",
      iconColor: "white",
      markerColor: "blue-dark",
      shape: "penta"
  })
};

// Fetch Bigfoot data
fetch('../data/bigfoot_coordinates_clean_cols2.json')
    .then(response => response.json())
    .then(data => {
      console.log(data)
        // Loop through the reports
        data.forEach(report => {
            // Extracting relevant data for each report
            let reportClass = report.report_class;  
            let reportNumber = report.report_number;  
            let county = report.county;
            // let year = report.year;
            let latitude = report.latitude;
            let longitude = report.longitude;

            // Default icon in case reportClass is undefined or doesn't match A, B, or C
            let markerIcon = icons.classC; // Fallback icon

            // Determine the icon based on report class
            if (reportClass === "A") {
                markerIcon = icons.classA;
            } else if (reportClass === "B") {
                markerIcon = icons.classB;
            }

            // Create a marker for each report and add it to the marker cluster group
            const marker = L.marker([latitude, longitude], { icon: markerIcon })
                .bindPopup(`
                    <b>Bigfoot Sighting Report</b><br>
                    Report Number: ${reportNumber}<br>
                    Location: ${county}<br>
                    Report Class: ${reportClass} 
                `);
            
            markerClusters.addLayer(marker);
        });

        // Add the marker cluster group to the map
        map.addLayer(markerClusters);
    })
    .catch(error => console.error('Error loading Bigfoot data:', error));
