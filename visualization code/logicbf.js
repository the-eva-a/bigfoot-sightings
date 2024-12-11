// Initialize the map
const map = L.map('map').setView([39.8283, -98.5795], 4); // Center of the US

// Create base layers for the map
let baseLayers = {
  "StreetMap" : L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl={language}', {
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

// Add layer control to switch between layers
L.control.layers(baseLayers).addTo(map);

// Create a new marker cluster group for future use of marker functionality
let markerClusters = L.markerClusterGroup();

// Function to create the SVG icon with an oval background color and PNG image
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

// Initialize the yearsAvailable
let yearsAvailable = new Set();

// Function to create a combined filter control
const combinedControl = L.Control.extend({
  onAdd: function () {
    const div = L.DomUtil.create('div', 'combined-controls');

    // Set some styles for the container (to position the controls in the top-right)
    div.style.backgroundColor = 'white';
    div.style.padding = '10px';
    div.style.borderRadius = '5px';
    div.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    div.style.marginBottom = '10px';

    // Create the year dropdown (filter control)
    const yearSelect = document.createElement('select');
    yearSelect.innerHTML = `
      <option value="">Select Year</option>
      ${Array.from(yearsAvailable).map(year => `<option value="${year}">${year}</option>`).join('')}
    `;
    div.appendChild(yearSelect);

    // Create the class filter checkboxes with colors next to each class
    const classFiltersDiv = document.createElement('div');
    classFiltersDiv.innerHTML = `
      <label>
        <input type="checkbox" checked data-class="classA">
        <span style="color:green;">&#11044;</span> Class A
      </label><br>
      <label>
        <input type="checkbox" checked data-class="classB">
        <span style="color:orange;">&#11044;</span> Class B
      </label><br>
      <label>
        <input type="checkbox" checked data-class="classC">
        <span style="color:red;">&#11044;</span> Class C
      </label>
    `;
    div.appendChild(classFiltersDiv);

    return div;
  }
});

// Add the combined control to the map
map.addControl(new combinedControl({ position: 'topright' }));

// Fetch Bigfoot data
fetch('../data/bigfoot_coordinates_clean_cols.json')
  .then(response => response.json())
  .then(data => {
    console.log(data)
    // Initialize the markersByClass object
    let markersByClass = {
      classA: [],
      classB: [],
      classC: []
    };

    data.forEach(report => {
      let reportClass = report.report_class;
      let reportNumber = report.report_number;
      let county = report.county;
      let year = report.year;
      let latitude = report.latitude;
      let longitude = report.longitude;

      let markerIcon = icons.classC;

      if (reportClass === "A") {
        markerIcon = icons.classA;
      } else if (reportClass === "B") {
        markerIcon = icons.classB;
      }

      const marker = L.marker([latitude, longitude], { icon: markerIcon })
        .bindPopup(`
          <b>Bigfoot Sighting Report</b><br>
          Report Number: ${reportNumber}<br>
          Location: ${county}<br>
          Report Class: ${reportClass}<br>
          Year: ${year}<br>
          Link: <a href="https://bfro.net/GDB/show_report.asp?id=${reportNumber}" target="_blank">View Report</a>
        `);

      // Add marker to the respective class
      if (markersByClass[reportClass]) {
        markersByClass[reportClass].push(marker);
      }

      yearsAvailable.add(year); // Add the year to the yearsAvailable set
    });
    // Log the markersByClass object to check if it contains markers
    console.log(markersByClass);
    
    // Add the markers to the marker cluster
    for (let className in markersByClass) {
        console.log(`Markers for ${className}:`, markersByClass[className]); // Log the markers for each class
        markersByClass[className].forEach(marker => {
          console.log("Adding marker to cluster:", marker); // Check if markers are being added
          markerClusters.addLayer(marker);
        });
      }
      map.addLayer(markerClusters);

    // Update the year dropdown with the available years
    const yearSelect = document.querySelector('select');
    yearSelect.innerHTML = `
      <option value="">Select Year</option>
      ${Array.from(yearsAvailable).map(year => `<option value="${year}">${year}</option>`).join('')}
    `;

    // Year selection filtering
    yearSelect.addEventListener('change', function () {
      const selectedYear = this.value;
      markerClusters.clearLayers();

      Object.keys(markersByClass).forEach(className => {
        markersByClass[className].forEach(marker => {
          if (!selectedYear || marker._popup._content.includes(`Year: ${selectedYear}`)) {
            markerClusters.addLayer(marker);
          }
        });
      });
    });

    // Class selection filtering
    document.querySelector('.combined-controls').addEventListener('change', function () {
      const checkedClasses = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.getAttribute('data-class'));

      markerClusters.clearLayers();

      Object.keys(markersByClass).forEach(className => {
        if (checkedClasses.includes(className)) {
          markersByClass[className].forEach(marker => markerClusters.addLayer(marker));
        }
      });
    });
  })
  .catch(error => console.error('Error loading Bigfoot data:', error));
