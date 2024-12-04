// Initialize the map
const map = L.map('map').setView([39.8283, -98.5795], 4); // Center of the US

// Add a tile layer (map background)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch Bigfoot data
fetch('../data/bigfoot_coordinates_clean_cols.json')
    .then(response => response.json())
    .then( data => {
        // Add a marker for each sighting
        data.forEach(sighting => {
            L.marker([sighting.latitude, sighting.longitude])
            .addTo(map)
        })
    })  
    .catch(error => console.error('Error loading Bigfoot data:', error));
