// Initialize the map
const map = L.map('map').setView([39.8, -98.5], 4); // Center of the US

// Create base layers for the map (StreetMap and OpenTopoMap)
let baseLayers = {
  "StreetMap": L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl={language}', {
    attribution: 'Map data &copy;2024 Google',
    subdomains: '0123',
    maxZoom: 22,
    language: 'en'
  }),
  "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a> contributors',
    maxZoom: 17,
    minZoom: 3
  })
};

// Add the default map layer (StreetMap) to the map
baseLayers["StreetMap"].addTo(map);

// Create a new marker cluster group to hold all the markers for clustering
let markerClusters = L.markerClusterGroup();

// Initialize LayerGroups for each report class (A, B, C)
let classClusters = {
  classA: L.markerClusterGroup(),
  classB: L.markerClusterGroup(),
  classC: L.markerClusterGroup()
};

// Add the base layers and the class layers to the map for interactive control
L.control.layers(baseLayers, classClusters).addTo(map);

// Function to create the SVG icon with an oval background color and PNG image of Bigfoot!
function createSvgIconWithImage(color) {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <svg width="35" height="45" viewBox="0 0 35 45">
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

// Function to create the map legend that shows class names with corresponding colors
const legend = L.control({ position: 'topright' });

legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  div.style.backgroundColor = 'white'; // White background
  div.style.padding = '10px';           // Padding around the legend
  div.style.borderRadius = '5px';       // Rounded corners
  div.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)'; // Shadow for better visibility

  const classes = ['Class A', 'Class B', 'Class C'];  // Class names
  const colors = ['green', 'orange', 'red'];  // Colors for each class

  // Loop through each class and add a colored circle and label to the legend
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

// Initialize the yearsAvailable set to hold unique years for the year dropdown filter
let yearsAvailable = new Set();

// Fetch Bigfoot data from a local JSON file
fetch('../data/bigfoot_coordinates_clean_cols.json')
  .then(response => response.json())
  .then(data => {
    console.log(data);  // Log the entire dataset for debugging

    // Loop through the data and create markers for each sighting report
    data.forEach(report => {
      let reportClass = report.report_class;  // Report classification (A, B, C)
      let reportNumber = report.report_number;  // Report number
      let county = report.county;  // Location of the sighting
      let year = report.year;  // Year of the sighting
      let latitude = report.latitude;  // Latitude of the sighting
      let longitude = report.longitude;  // Longitude of the sighting

      // Check if the report has valid latitude and longitude
      if (latitude && longitude) {
        let markerIcon = icons.classC;  // Default icon is Class
        if (reportClass === "A") {
          markerIcon = icons.classA;  // Use Class A icon if the class is A
        } else if (reportClass === "B") {
          markerIcon = icons.classB;  // Use Class B icon if the class is B
        }

        // Create a new marker with the appropriate icon and bind a popup with the report details
        const marker = L.marker([latitude, longitude], {
          icon: markerIcon,
          year: year, // Store year directly in the marker options
          reportClass: reportClass // Store reportClass directly in the marker options
        })
        .bindPopup(`
          <b>Bigfoot Sighting Report</b><br>
          Report Number: ${reportNumber}<br>
          Location: ${county}<br>
          Report Class: ${reportClass}<br>
          Year: ${year}<br>
          Link: <a href="https://bfro.net/GDB/show_report.asp?id=${reportNumber}" target="_blank">View Report</a>
        `);

        // Add the marker to the appropriate class layer based on reportClass
        if (reportClass === "A") {
          classClusters.classA.addLayer(marker);
        } else if (reportClass === "B") {
          classClusters.classB.addLayer(marker);
        } else if (reportClass === "C") {
          classClusters.classC.addLayer(marker);
        }

        // Add the marker to the markerClusters for clustering
        markerClusters.addLayer(marker);
      }

      // Add the year to the yearsAvailable set (for the year dropdown filter)
      if (year) {
        yearsAvailable.add(year);  // Add year to the set of available years
      }
    });

    // Add the class layers to the map
    map.addLayer(classClusters.classA);
    map.addLayer(classClusters.classB);
    map.addLayer(classClusters.classC);

    // Update the year dropdown
    const yearSelect = document.querySelector('select');
    yearSelect.innerHTML = `
      <option value="">Select Year</option>
      ${Array.from(yearsAvailable).sort((a, b) => b - a).map(year => `<option value="${year}">${year}</option>`).join('')}
    `;

    // Add event listener to filter by year
    yearSelect.addEventListener('change', function () {
      const selectedYear = this.value;

      // Clear class layers
      classClusters.classA.clearLayers();
      classClusters.classB.clearLayers();
      classClusters.classC.clearLayers();

      // Add markers based on the selected year
      data.forEach(report => {
        if (!selectedYear || report.year == selectedYear) {
          let reportClass = report.report_class;
          let latitude = report.latitude;
          let longitude = report.longitude;

          // Set the marker icon based on the report class
          let markerIcon = icons.classC;
          if (reportClass === "A") markerIcon = icons.classA;
          else if (reportClass === "B") markerIcon = icons.classB;

          // Create the marker with the appropriate icon and popup details
          const marker = L.marker([latitude, longitude], { icon: markerIcon }).bindPopup(`
            <b>Bigfoot Sighting Report</b><br>
            Report Number: ${report.report_number}<br>
            Location: ${report.county}<br>
            Report Class: ${reportClass}<br>
            Year: ${report.year}<br>
            <a href="https://bfro.net/GDB/show_report.asp?id=${report.report_number}" target="_blank">View Report</a>
          `);

          // Add marker to the correct class layer
          if (reportClass === "A") {
            classClusters.classA.addLayer(marker);
          } else if (reportClass === "B") {
            classClusters.classB.addLayer(marker);
          } else if (reportClass === "C") {
            classClusters.classC.addLayer(marker);
          }
        }
      });
    });
  });
