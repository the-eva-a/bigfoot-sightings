// Initialize the map
const map = L.map('map').setView([37.8, -96], 4);  // Center on the US

// Add a tile layer to the map (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// URL to the GeoJSON US state boundaries
const geoJsonUrl = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

// Fetch Bigfoot state pop data
fetch('data/bigfoot_state_pop.json')  // Replace with your actual API endpoint
    .then(response => response.json())
    .then(data => {
        console.log('Bigfoot data fetched:', data);  // Log the fetched data to check if it's correct
        const reportData = {};
        const populationData = {};

        // Calculate report counts per state and population estimate
        data.forEach(row => {
            if (!row.state || !row.POPESTIMATE2023) {
                return;  // Skip invalid rows
            }
            const stateName = row.state; // Directly use the full state name from the API
            const population = row.POPESTIMATE2023;  // Get the population estimate

            // Update report count
            if (!reportData[stateName]) {
                reportData[stateName] = 0;
            }
            reportData[stateName]++;

            // Store population estimate
            populationData[stateName] = population;
        });

        // Log the report data to check
        console.log('Report data by state:', reportData);
        console.log('Population data by state:', populationData);

        // Function to get the color for each state based on total report count
        function getColorForReports(d) {
            if (d > 1000) return '#800026';
            else if (d > 500) return '#BD0026';
            else if (d > 100) return '#E31A1C';
            else if (d > 50) return '#FC4E2A';
            else if (d > 20) return '#FD8D3C';
            else if (d > 10) return '#FEB24C';
            else if (d > 5) return '#FED976';
            else return '#FFEDA0';
        }

        // Function to get the color for each state based on reports per population
        function getColorForReportsPerPop(d) {
            if (d > 0.00007590030820900872) return '#800026';
            else if (d > 0.000060) return '#BD0026';
            else if (d > 0.000045) return '#E31A1C';
            else if (d > 0.000030) return '#FC4E2A';
            else if (d > 0.000015) return '#FD8D3C';
            else return '#FFEDA0';
        }

        // Function to style each feature (state) in the GeoJSON based on total report count
        function styleForReports(feature) {
            const state = feature.properties.name;
            const reportCount = reportData[state] || 0;  // Default to 0 if no data
            return {
                fillColor: getColorForReports(reportCount),
                weight: 2,
                opacity: 0.5,  // Default opacity for all states
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        // Function to style each feature (state) in the GeoJSON based on reports per population
        function styleForReportsPerPop(feature) {
            const state = feature.properties.name;
            const reportCount = reportData[state] || 0;  // Default to 0 if no data
            const population = populationData[state] || 1;  // Default to 1 if no population data
            const reportDensity = reportCount / population;  // Calculate report density based on population
            return {
                fillColor: getColorForReportsPerPop(reportDensity),
                weight: 2,
                opacity: 0.5,  // Default opacity for all states
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        // Function to bind popups with state name, report count, and population
        function onEachFeature(feature, layer) {
            const state = feature.properties.name;
            const reportCount = reportData[state] || 0;  // Default to 0 if no data
            const population = populationData[state] || 0;  // Default to 0 if no population data
            const popupContent = `
                <strong>State:</strong> ${state}<br>
                <strong>Report Count:</strong> ${reportCount}<br>
                <strong>Population:</strong> ${population}
            `;
            
            // Bind the popup to each feature on hover
            layer.on({
                mouseover: function(e) {
                    var layer = e.target;

                    // Set the hovered state to be more prominent
                    layer.setStyle({
                        weight: 3,
                        color: '#666',
                        dashArray: '',
                        fillOpacity: 0.9,
                        opacity: 1  // Full opacity on hover
                    });

                    // Make all other states less prominent
                    map.eachLayer(function(l) {
                        // Only apply style to GeoJSON layers
                        if (l instanceof L.GeoJSON && l !== layer) {
                            l.setStyle({
                                opacity: 0.2  // Lower opacity for other states
                            });
                        }
                    });

                    // Display the popup
                    layer.bindPopup(popupContent).openPopup();
                },
                mouseout: function(e) {
                    var layer = e.target;

                    // Reset style to default when mouse leaves
                    layer.setStyle({
                        weight: 2,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7,
                        opacity: 0.5  // Default opacity for all states
                    });

                    // Reset opacity of all other layers to normal
                    map.eachLayer(function(l) {
                        // Only apply style to GeoJSON layers
                        if (l instanceof L.GeoJSON && l !== layer) {
                            l.setStyle({
                                opacity: 0.5  // Reset opacity for other states
                            });
                        }
                    });

                    // Close the popup when mouse leaves
                    layer.closePopup();
                }
            });
        }

        // Fetch and add the GeoJSON data to the map
        fetch(geoJsonUrl)
            .then(response => response.json())
            .then(geojson => {
                console.log('GeoJSON data fetched:', geojson);  // Log the GeoJSON data

                // Create the choropleth layer for total reports with popups
                const reportLayer = L.geoJSON(geojson, { 
                    style: styleForReports,
                    onEachFeature: onEachFeature
                }).addTo(map);

                // Create the choropleth layer for reports per population with popups
                const reportPerPopLayer = L.geoJSON(geojson, { 
                    style: styleForReportsPerPop,
                    onEachFeature: onEachFeature
                }).addTo(map);

                // Create a Layer Control to toggle between the two layers
                const layerControl = L.control.layers({}, {
                    "Total Reports": reportLayer,
                    "Reports per Population": reportPerPopLayer
                }).addTo(map);
            })
            .catch(error => {
                console.error('Error fetching GeoJSON data:', error);
            });

        // Add a legend to the map for "Total Reports"
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            const grades = [0, 5, 10, 20, 50, 100, 500, 1000]; // Total report thresholds for legend
            const labels = [];

            // Loop through the grades and generate a label with a colored square for each range
            for (let i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColorForReports(grades[i] + 1) + '; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            return div;
        };

        legend.addTo(map);
    })
    .catch(error => {
        console.error('Error fetching Bigfoot data:', error);
    });



