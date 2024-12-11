// Initialize the map
const map = L.map('map').setView([39.8, -98.5], 4); // Center of the US

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

// Function to create the SVG icon with an oval background color and PNG image of Bigfoot!
function createSvgIconWithImage(color) {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <svg width="35" height="45" viewBox="0 0 35 45">
        <!-- Add an Background image with color fill and opacity % for styling -->
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
    // Create a container 'div' for the control and assign it the class 'combined-controls'
    const div = L.DomUtil.create('div', 'combined-controls');

    // Set styles for the container (controls positioning and appearance)
    div.style.backgroundColor = 'white'; // Background color of the control
    div.style.padding = '10px';           // Padding around the control content
    div.style.borderRadius = '5px';       // Rounded corners for the control
    div.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)'; // Shadow effect to make it stand out
    div.style.marginBottom = '10px';      // Margin to separate the control from elements below

    // Create a dropdown (<select>) element for selecting the year
    const yearSelect = document.createElement('select');

    // Populate the dropdown with available years dynamically from the yearsAvailable set
    // The first option is a placeholder, and subsequent options are populated from the Set
    yearSelect.innerHTML = `
      <option value="">Select Year</option>
      ${Array.from(yearsAvailable)  // Convert the Set to an array to use map
        .map(year => `<option value="${year}">${year}</option>`) // Create <option> for each year
        .join('')}  // Join the array of <option> elements into a string for the dropdown
    `;
    
    // Append the dropdown to the control container
    div.appendChild(yearSelect);

    // Create a container div for the class filters (checkboxes)
    const classFiltersDiv = document.createElement('div');

    // Populate the class filters div with checkboxes, each representing a report class
    // Each checkbox is labeled with a colored circle representing the class
    classFiltersDiv.innerHTML = `
      <label>
        <input type="checkbox" checked data-class="classA">  <!-- Class A checkbox -->
        <span style="color:green;">&#11044;</span> Class A  <!-- Green circle next to the label -->
      </label><br>
      <label>
        <input type="checkbox" checked data-class="classB">  <!-- Class B checkbox -->
        <span style="color:orange;">&#11044;</span> Class B  <!-- Orange circle next to the label -->
      </label><br>
      <label>
        <input type="checkbox" checked data-class="classC">  <!-- Class C checkbox -->
        <span style="color:red;">&#11044;</span> Class C     <!-- Red circle next to the label -->
      </label>
    `;
    
    // Append the class filters div to the control container
    div.appendChild(classFiltersDiv);

    // Return the control container (div) to be displayed on the map
    return div;
  }
});


// Add the combined control to the map
map.addControl(new combinedControl({ position: 'topright' }));


// Fetch Bigfoot data from a local JSON file containing coordinates and other details
fetch('../data/bigfoot_coordinates_clean_cols.json')
  .then(response => response.json())
  .then(data => {
    console.log(data);  // Log the entire dataset to the console for debugging

    // Initialize an object to store markers categorized by report class
    let markersByClass = {
      classAMarkers: [],  // Array for markers of Class A sightings
      classBMarkers: [],  // Array for markers of Class B sightings
      classCMarkers: []   // Array for markers of Class C sightings
    };

    // Loop through each report in the data array
    data.forEach(report => {
      // Extract relevant information from each report
      let reportClass = report.report_class; 
      let reportNumber = report.report_number;  
      let county = report.county;  
      let year = report.year;  
      let latitude = report.latitude;  
      let longitude = report.longitude;  

      // Log the details of each report for debugging
      console.log(`Processing report ${reportNumber} - Class: ${reportClass}, Latitude: ${latitude}, Longitude: ${longitude}`);

      // Assign the appropriate marker icon based on the report class
      let markerIcon = icons.classC;  // Default to Class C icon
      if (reportClass === "A") {
        markerIcon = icons.classA;  // Use Class A icon if the class is A
      } else if (reportClass === "B") {
        markerIcon = icons.classB;  // Use Class B icon if the class is B
      }

      // Create a new marker with the appropriate icon and bind a popup with the report details
      const marker = L.marker([latitude, longitude], { icon: markerIcon })
        .bindPopup(`
          <b>Bigfoot Sighting Report</b><br>
          Report Number: ${reportNumber}<br>
          Location: ${county}<br>
          Report Class: ${reportClass}<br>
          Year: ${year}<br>
          Link: <a href="https://bfro.net/GDB/show_report.asp?id=${reportNumber}" target="_blank">View Report</a>
        `);

      // Based on the report class, push the marker into the respective class's array
      if (reportClass === "A") {
        markersByClass.classAMarkers.push(marker);  // Class A markers
      } else if (reportClass === "B") {
        markersByClass.classBMarkers.push(marker);  // Class B markers
      } else if (reportClass === "C") {
        markersByClass.classCMarkers.push(marker);  // Class C markers
      }

      // Add the year to the yearsAvailable set (this will be used for filtering by year)
      if (year) {
        yearsAvailable.add(year);  // Add year to the set of available years
      }
    });

    // Log the markersByClass object to check that it contains markers for each class
    console.log(markersByClass);

    // Loop through each class in the markersByClass object and add the markers to the marker cluster
    for (let className in markersByClass) {
      markersByClass[className].forEach(marker => {
        markerClusters.addLayer(marker);  // Add each marker to the cluster layer
      });
    }

    // Add the entire marker cluster to the map after all markers are added
    map.addLayer(markerClusters);

    // Update the year dropdown with the available years for filtering in descending order
    const yearSelect = document.querySelector('select');  // Find the year dropdown element

    // Convert the yearsAvailable set to an array, sort it in descending order, then map over the sorted years to create option elements
    yearSelect.innerHTML = `
      <option value="">Select Year</option>
      ${Array.from(yearsAvailable)
        .sort((a, b) => b - a)  // Sort the years in descending order
        .map(year => `<option value="${year}">${year}</option>`)  // Create the option elements
        .join('')}  // Join them into a single string for the dropdown
    `;


    // Add event listener to filter the map based on selected year
    yearSelect.addEventListener('change', function () {
      const selectedYear = this.value;  // Get the selected year from the dropdown
      markerClusters.clearLayers();  // Clear existing markers from the cluster

      // Loop through each class and re-add markers that match the selected year
      Object.keys(markersByClass).forEach(className => {
        markersByClass[className].forEach(marker => {
          if (!selectedYear || marker._popup._content.includes(`Year: ${selectedYear}`)) {
            // If no year is selected or the marker's popup contains the selected year, add the marker back
            markerClusters.addLayer(marker);
          }
        });
      });
    });

    // Add event listener to filter the map based on checked class filters
    document.querySelector('.combined-controls').addEventListener('change', function () {
      const checkedClasses = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))  // Get all checked checkboxes
        .map(checkbox => checkbox.getAttribute('data-class'));  // Get the 'data-class' attribute for each checked checkbox

      markerClusters.clearLayers();  // Clear existing markers from the cluster

      // Loop through each class and re-add markers that belong to the selected classes
      Object.keys(markersByClass).forEach(className => {
        if (checkedClasses.includes(className)) {
          // If the class is selected (checked), add its markers to the cluster
          markersByClass[className].forEach(marker => markerClusters.addLayer(marker));
        }
      });
    });
  })
  .catch(error => console.error('Error loading Bigfoot data:', error));  // Log an error if the data could not be loaded
