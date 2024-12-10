// Initialize the map
const map = L.map('map').setView([39.8283, -98.5795], 4); // Center of the US

// Create base layers for the map
let baseLayers = {
  "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }),
  "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a> contributors',
      maxZoom: 17,
      minZoom: 3
  })
};

// Add the default map (OpenStreetMap) to the map
baseLayers["OpenStreetMap"].addTo(map);

// Add layer control to switch between layers
L.control.layers(baseLayers).addTo(map);

// Create a new marker cluster group.
let markerClusters = L.markerClusterGroup();


// Function to create the SVG icon with an oval background color and PNG image
function createSvgIconWithImage(color) {
  return L.divIcon({
      className: 'custom-icon',  // Optional for extra styling
      html: `
          <svg width="35" height="45" viewBox="0 0 35 45">
              <!-- Create an oval (ellipse) background with transparency using fill-opacity -->
              <ellipse cx="17.5" cy="22.5" rx="17.5" ry="22.5" fill="${color}" fill-opacity="0.5" />
              <image x="0" y="0" width="35" height="45" href="visualization code/img/markers_default.png" />
          </svg>`
  });
}


// Initialize icons with dynamic colors for each class
let icons = {
  classA: createSvgIconWithImage("green"),  
  classB: createSvgIconWithImage("orange"),     
  classC: createSvgIconWithImage("red")     
};

// Function to create a legend for the map
function createLegend() {
    return L.control({ position: 'topright' });  // Set legend to top-right position
  }
  
  const legend = createLegend();  // You were missing this line to initialize the legend
  
  // Add the legend to the map
  legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      
      // Set a white background with padding for the legend
      div.style.backgroundColor = 'white'; // White background
      div.style.padding = '10px';           // Padding around the legend
      div.style.borderRadius = '5px';       // Optional: Rounded corners for the rectangle
      div.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)'; // Optional: Shadow for better visibility
  
      const classes = ['Class A', 'Class B', 'Class C'];  // Class names in the order they will appear
      const colors = ['green', 'orange', 'red'];  // Corresponding colors for each class
  
      // Loop through each class and add a colored box and label to the legend
      for (let i = 0; i < classes.length; i++) {
          div.innerHTML += `
              <div style="display: flex; align-items: center;">
                  <svg width="20" height="20" viewBox="0 0 20 20" style="margin-right: 5px;">
                      <circle cx="10" cy="10" r="8" fill="${colors[i]}" fill-opacity="0.5"></circle>
                  </svg>
                  <span>${classes[i]}</span>
              </div>
          `;
      }
      
      return div;
  };
  

// Add the legend to the map
legend.addTo(map);

// Fetch Bigfoot data

fetch('https://raw.githubusercontent.com/the-eva-a/bigfoot-sightings/refs/heads/main/data/bigfoot_coordinates_clean_cols.json')
    .then(response => response.json())
    .then(data => {
      console.log(data)
        // Loop through the reports
        data.forEach(report => {
            // Extracting relevant data for each report
            let reportClass = report.report_class;  
            let reportNumber = report.report_number;  
            let county = report.county;
            let year = report.year;
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
                    Report Class: ${reportClass}<br>
                    Year: ${year}</br>
                    Link: <a href="https://bfro.net/GDB/show_report.asp?id=${reportNumber}" target="_blank">View Report</a> 
                `);
            
            markerClusters.addLayer(marker);
        });

        // Add the marker cluster group to the map
        map.addLayer(markerClusters);
    })
    .catch(error => console.error('Error loading Bigfoot data:', error));
