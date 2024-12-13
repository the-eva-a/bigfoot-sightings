// Initialize the map
const map = L.map('map').setView([39.8, -98.5], 4); // Center of the US

// Create base layers for the map
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

// Add the default map (StreetMap) to the map
baseLayers["StreetMap"].addTo(map);

// Initialize LayerGroups for each class
let classLayers = {
  classA: new L.LayerGroup(),
  classB: new L.LayerGroup(),
  classC: new L.LayerGroup()
};

// Add layer control to switch between layers
L.control.layers(baseLayers, classLayers).addTo(map);

// Create a new marker cluster group for clustering markers
let markerClusters = L.markerClusterGroup();

// Function to create the SVG icon with an oval background color and PNG image of Bigfoot!
function createSvgIconWithImage(color) {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <svg width="35" height="45" viewBox="0 0 35 45">
        <!-- Add a Background image with color fill and opacity % for styling -->
        <ellipse cx="17.5" cy="22.5" rx="17.5" ry="22.5" fill="${color}" fill-opacity="0.5" />
        <!-- Reference the Bigfoot image for use as our icon -->
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

// Initialize the yearsAvailable set to hold unique years for the year dropdown filter
let yearsAvailable = new Set();

// Define a custom control for Leaflet, extending L.Control to create a combined filter control
const combinedControl = L.Control.extend({
  onAdd: function () {
    const div = L.DomUtil.create('div', 'combined-controls');
    div.style.backgroundColor = 'white';
    div.style.padding = '10px';
    div.style.borderRadius = '5px';
    div.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    div.style.marginBottom = '10px';

    const yearSelect = document.createElement('select');
    yearSelect.innerHTML = `
      <option value="">Select Year</option>
      ${Array.from(yearsAvailable)
        .map(year => `<option value="${year}">${year}</option>`)
        .join('')}
    `;
    div.appendChild(yearSelect);

    const classFiltersDiv = document.createElement('div');
    classFiltersDiv.innerHTML = `
      <label><input type="checkbox" checked data-class="classA"><span style="color:green;">&#11044;</span> Class A</label><br>
      <label><input type="checkbox" checked data-class="classB"><span style="color:orange;">&#11044;</span> Class B</label><br>
      <label><input type="checkbox" checked data-class="classC"><span style="color:red;">&#11044;</span> Class C</label>
    `;
    div.appendChild(classFiltersDiv);

    return div;
  }
});

map.addControl(new combinedControl({ position: 'topright' }));

// Fetch Bigfoot data from a local JSON file containing coordinates and other details
fetch('../data/bigfoot_coordinates_clean_cols.json')
  .then(response => response.json())
  .then(data => {
    console.log(data);  // Log the entire dataset to the console for debugging

    // Loop through each report in the data array and add markers to the correct class layer
    data.forEach(report => {
      let reportClass = report.report_class;
      let reportNumber = report.report_number;
      let county = report.county;
      let year = report.year;
      let latitude = report.latitude;
      let longitude = report.longitude;

      // Assign the appropriate marker icon based on the report class
      let markerIcon = icons.classC;  // Default to Class C icon
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

      // Add the marker to the appropriate class layer
      if (reportClass === "A") {
        classLayers.classA.addLayer(marker);
      } else if (reportClass === "B") {
        classLayers.classB.addLayer(marker);
      } else if (reportClass === "C") {
        classLayers.classC.addLayer(marker);
      }

      // Add marker to the cluster group (this ensures clustering)
      markerClusters.addLayer(marker);

      // Add the year to the yearsAvailable set (this will be used for filtering by year)
      if (year) {
        yearsAvailable.add(year);  // Add year to the set of available years
      }
    });

    // Add the markerClusters to the map
    map.addLayer(markerClusters);

    // Update the year dropdown
    const yearSelect = document.querySelector('select');
    yearSelect.innerHTML = `
      <option value="">Select Year</option>
      ${Array.from(yearsAvailable).sort((a, b) => b - a).map(year => `<option value="${year}">${year}</option>`).join('')}
    `;

    // Add event listener to filter by year
    yearSelect.addEventListener('change', function () {
      const selectedYear = this.value;

      // Clear all class layers and marker clusters
      classLayers.classA.clearLayers();
      classLayers.classB.clearLayers();
      classLayers.classC.clearLayers();
      markerClusters.clearLayers();

      // Add markers based on the selected year
      data.forEach(report => {
        if (!selectedYear || report.year == selectedYear) {
          let reportClass = report.report_class;
          let latitude = report.latitude;
          let longitude = report.longitude;

          let markerIcon = icons.classC;
          if (reportClass === "A") markerIcon = icons.classA;
          else if (reportClass === "B") markerIcon = icons.classB;

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
            classLayers.classA.addLayer(marker);
          } else if (reportClass === "B") {
            classLayers.classB.addLayer(marker);
          } else if (reportClass === "C") {
            classLayers.classC.addLayer(marker);
          }

          // Also add marker to the cluster layer
          markerClusters.addLayer(marker);
        }
      });

      // Add the updated markerClusters to the map
      map.addLayer(markerClusters);
    });

    // Create the overlay controls for the layers
    let overlays = {
      "Class A": classLayers.classA,
      "Class B": classLayers.classB,
      "Class C": classLayers.classC
    };

    // Add control for layers to the map
    L.control.layers(null, overlays).addTo(map);
  });
