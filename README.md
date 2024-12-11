# README: Bigfoot Report Visualization Map

This project visualizes Bigfoot report data across the United States using a choropleth map. The map displays the number of Bigfoot reports per state and also shows how report frequency correlates with population density. The map is built using the **Leaflet** library, **OpenStreetMap** tiles, and GeoJSON data for US state boundaries.

## Features

- **Interactive Map**: View Bigfoot report data across all US states.
- **Two Layers**:
  - **Total Reports**: Displays the total number of reports for each state.
  - **Reports per Population**: Displays the number of reports per capita, showing report density.
- **Hover Effects**: Mouse over any state to see a popup with detailed information about the reports and population.
- **Layer Control**: Toggle between the two layers (Total Reports or Reports per Population) using the layer control on the map.
- **Legend**: Provides a color-coded legend for both layers, helping you understand the ranges of report counts.
  
## Libraries & Tools

- **Leaflet**: A leading JavaScript library for interactive maps.
- **OpenStreetMap**: Used as the base map layer.
- **GeoJSON**: For US state boundaries.
- **Fetch API**: For fetching the Bigfoot data and GeoJSON data.

## Files

1. **index.html**: HTML file that sets up the map and imports necessary libraries and scripts.
2. **bigfoot_state_pop.json**: JSON file containing the Bigfoot report data (state, report counts, population estimates).
3. **us-states.json**: GeoJSON file containing US state boundaries.

## How It Works

### 1. Initialize Map

The map is centered on the US with a zoom level of 4 using Leaflet:

```javascript
const map = L.map('map').setView([37.8, -96], 4);
```

### 2. Tile Layer (OpenStreetMap)

We add an OpenStreetMap tile layer to the map for geographic context:

```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
```

### 3. Fetch Bigfoot Report Data

We fetch the Bigfoot report data from an API (or local file):

```javascript
fetch('data/bigfoot_state_pop.json')
    .then(response => response.json())
    .then(data => {
        // Process the data for report counts and population estimates
    });
```

The data is processed to create two objects:
- `reportData`: Contains the total report count per state.
- `populationData`: Contains the population estimates per state.

### 4. Choropleth Styling

Two different styles are applied to the map based on the report data:
- **Total Reports**: Uses a color scale based on total report counts per state.
- **Reports per Population**: Uses a color scale based on report density (reports per capita).

The colors are determined by the functions `getColorForReports` and `getColorForReportsPerPop`:

```javascript
function getColorForReports(d) {
    // Determines color based on total report count
}

function getColorForReportsPerPop(d) {
    // Determines color based on report density (reports per population)
}
```

### 5. Popups and Hover Effects

When hovering over a state, the user will see a popup displaying the state name, report count, and population:

```javascript
function onEachFeature(feature, layer) {
    const state = feature.properties.name;
    const reportCount = reportData[state] || 0;
    const population = populationData[state] || 0;
    const popupContent = `
        <strong>State:</strong> ${state}<br>
        <strong>Report Count:</strong> ${reportCount}<br>
        <strong>Population:</strong> ${population}
    `;
    
    // Apply hover effect
    layer.on({
        mouseover: function(e) { /* Highlight state */ },
        mouseout: function(e) { /* Reset style */ }
    });
}
```

### 6. Layer Control

The user can switch between viewing the "Total Reports" or "Reports per Population" layers using the layer control:

```javascript
const layerControl = L.control.layers({}, {
    "Total Reports": reportLayer,
    "Reports per Population": reportPerPopLayer
}).addTo(map);
```

### 7. Legend

A legend is added to show the color ranges for report counts:

```javascript
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () { /* Generate legend HTML */ };
legend.addTo(map);
```

### 8. Fetch and Add GeoJSON Data

The state boundaries are fetched from a GeoJSON file and added to the map using the `L.geoJSON()` method:

```javascript
fetch(geoJsonUrl)
    .then(response => response.json())
    .then(geojson => {
        // Add GeoJSON data to the map with appropriate styles and popups
    });
```

## How to Use

1. **Clone the repository** to your local machine.
2. Ensure you have the necessary **data files**:
   - `bigfoot_state_pop.json` (Bigfoot reports data).
   - `us-states.json` (GeoJSON file of US state boundaries).
3. Open the `index.html` file in a browser to view the interactive map.
4. Use the **layer control** on the top-right to toggle between "Total Reports" and "Reports per Population" layers.
5. **Hover** over a state to view report count and population information in a popup.

## Requirements

- **Modern web browser** (Chrome, Firefox, etc.)
- **Internet connection** (for fetching the tile layers and data)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
