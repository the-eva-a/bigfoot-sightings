# Bigfoot Sightings API

## Overview
This Flask-based API allows users to explore and analyze Bigfoot sighting data. The API supports filtering by state, county, keywords, date range, and proximity to a location. It leverages Pandas for data manipulation and provides a geolocation-based search functionality without requiring a Google Maps API key. The API is hosted on Render and accessible via a public URL.

---

## Access the API

The API is hosted on Render and can be accessed at:
```
https://bigfoot-sightings.onrender.com
```
---

## API Endpoints

| **Route**             | **Method** | **Description**                                                                 |
|------------------------|------------|---------------------------------------------------------------------------------|
| `/`                   | GET        | Homepage with basic information.                                               |
| `/info/<int:report_number>` | GET        | Retrieve detailed information for a specific report number.                     |
| `/state-reports`      | GET        | Retrieve all reports for a specified state (query parameter: `state`).          |
| `/county-reports`     | GET        | Retrieve all reports for a specified county (query parameters: `county`, `state`). |
| `/nearby-sightings`   | GET        | Retrieve sightings within a radius of a specified location (query: `location`, `radius`). |
| `/time-period-search` | GET        | Search reports by year range, state, and county (query: `start_year`, `end_year`, `state`, `county`). |
| `/word-search`        | GET        | Search for keywords in the "observed" field of the dataset (query: `keyword`).  |

---

## Example Usage

### 1. Retrieve Nearby Sightings
Query Parameters:
- `location` (str): Place name (e.g., "Seattle, WA").
- `radius` (float, optional): Radius in kilometers (default is 50 km).

Example:
```bash
curl "https://your-app-name.onrender.com/nearby-sightings?location=Seattle&radius=100"
```

### 2. Keyword Search
Search for a specific keyword in the "observed" field of the dataset.

Query Parameters:
- `keyword` (str): Word to search for.

Example:
```bash
curl "https://your-app-name.onrender.com/word-search?keyword=tree"
```

---

## Technologies Used

- **Flask**: For building the web API.
- **Pandas**: For data manipulation.
- **NumPy**: For mathematical operations (Haversine formula).
- **Geopy**: For geocoding locations without requiring an API key.

---

## Folder Structure
```
project_root/
├── app/                # Flask app folder
│   ├── app.py          # Main Flask application
│   ├── templates/      # HTML templates (if used)
│   ├── static/         # Static assets (CSS, JS, images)
├── data/               # Data folder containing Bigfoot dataset
│   └── bigfoot_coordinates_clean_cols.json
├── requirements.txt    # Dependency file
├── README.md           # Project documentation
```

---

## Notes

- The app uses `bigfoot_coordinates_clean_cols.json` as the main data source, located in the `data/` folder.
- The geocoding functionality uses **Geopy** to avoid requiring a Google Maps API key.

---

## Testing the API

You can test the API using tools like:

- **curl**: Command-line tool for making HTTP requests.
- **Postman**: GUI-based API testing tool.

Example `curl` request:
```bash
curl "https://your-app-name.onrender.com/state-reports?state=Washington"
```