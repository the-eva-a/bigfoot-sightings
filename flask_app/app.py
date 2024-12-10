# app.py
from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
import googlemaps
from dotenv import load_dotenv
import numpy as np

# Load environmental variables
load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

# Initalize the Google Maps API Client (Replace SECRET with the actual key)
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
# Initialize Flask app
app = Flask(__name__)

# Load data
data_path = os.path.join(os.path.dirname(__file__), '../data/bigfoot_coordinates_clean_cols.json')
bigfoot_data = pd.read_json(data_path)

# Validate schema during initialization
required_columns = ['observed', 'county', 'state', 'report_number', 'latitude', 'longitude', 'year']
missing_columns = set(required_columns) - set(bigfoot_data.columns)
if missing_columns:
    raise ValueError(f"Data is missing required columns: {', '.join(missing_columns)}")

# Get haversine function set up to create our circles around sightings.
def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the Earth's surface using the Haversine formula.

    Parameters:
    - lat1, lon1: Latitude and longitude of the first point in decimal degrees.
    - lat2, lon2: Latitude and longitude of the second point in decimal degrees.

    Returns:
    - Distance in kilometers between the two points.
    """
    R = 6371  # Earth's radius in kilometers

    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])

    # Differences in coordinates
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Haversine formula
    a = np.sin(dlat / 2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))

    return R * c


# Index Route
@app.route('/')
def index():
    """Homepage"""
    return render_template('index.html')

@app.route('/info/<int:report_number>', methods=['GET'])
def get_report_info(report_number):
    """
    Return detailed information for a specific report number
    """
    # Get report
    report = bigfoot_data[bigfoot_data['report_number'] == report_number]
    # Handle invalid report numbers
    if report.empty:
        return jsonify({"error": "Report not found"}), 404
    return  report.to_json(orient='records')

@app.route('/state-reports', methods=['GET'])
def get_state_info():
    """
    Return data for all reports in  a specific state.
    """
    # Get parameters
    state = request.args.get('state')
    # Get report
    report = bigfoot_data[bigfoot_data['state'].str.lower() == state.lower()]
    # Handle invalid state string
    if report.empty:
        return jsonify({"error": "State parameter not found"}), 404
    return report.to_json(orient='records')

@app.route('/county-reports', methods=['GET'])
def get_county_reports():
    """
    Return all reports in a specified county. Optionally specify a state to narrow down the search.
    Example usage:
        /county-reports?county=King
        /county-reports?county=King&state=Washington
    """
    # Get query parameters
    county = request.args.get('county')
    state = request.args.get('state')

    if not county:
        return jsonify({"error": "County parameter is required"}), 400

    # Filter by county (case-insensitive)
    reports = bigfoot_data[bigfoot_data['county'].str.lower() == f"{county} County".lower()]

    # If state is provided, further filter by state
    if state:
        reports = reports[reports['state'].str.lower() == state.lower()]

    # Handle no matching results
    if reports.empty:
        if state:
            return jsonify({"error": f"No reports found for {county} County, {state}"}), 404
        else:
            return jsonify({"error": f"No reports found for {county} County"}), 404

    # Return matching reports as JSON
    return reports.to_json(orient='records')

@app.route('/nearby-sightings', methods=['GET'])
def nearby_sightings():
    """
    Returns the records of sightings within some radius of a location.
    """
    location = request.args.get('location')
    radius_km = float(request.args.get('radius', 50))

    # Geocode the location
    geocode_result = gmaps.geocode(location)
    if not geocode_result:
        return jsonify({"error": "Location not found"}), 404
    
    # Extract the required data from the geocode response
    lat = geocode_result[0]['geometry']['location']['lat']
    lng = geocode_result[0]['geometry']['location']['lng']

    # Calculate distances and filter sightings
    bigfoot_data['distance_km'] = bigfoot_data.apply(
        lambda row: haversine(lat, lng, row['latitude'], row['longitude']), axis=1
    )

    # Create a new DataFrame of results within our radius
    nearby = bigfoot_data[bigfoot_data['distance_km'] <= radius_km]

    return nearby.to_json(orient='records')

@app.route('/time-period-search', methods=['GET'])
def search_by_date_range():
    """
    Search reports by year range, state, and county.
    """
    # Get params
    start_year = request.args.get('start_year')
    end_year = request.args.get('end_year')
    state = request.args.get('state', 'all')
    county = request.args.get('county', 'all')

    # Validate and convert year parameters
    try:
        start_year = int(start_year)
        end_year = int(end_year)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid year format. Please provide numeric values."}), 400

    # Ensure start_year is less than or equal to end_year
    if start_year > end_year:
        start_year, end_year = end_year, start_year

    # Filter by year range
    filtered_df = bigfoot_data[
        (bigfoot_data['year'] >= start_year) & (bigfoot_data['year'] <= end_year)
    ]

    # Filter by state if specified
    if state != 'all':
        filtered_df = filtered_df[filtered_df['state'].str.lower() == state.lower()]
        if filtered_df.empty:
            return jsonify({"error": f"No reports found for {state}"}), 404

    # Filter by county if specified
    if county != 'all':
        if 'county' not in county.lower():
            county = f"{county} County"
        filtered_df = filtered_df[filtered_df['county'].str.lower() == county.lower()]
        if filtered_df.empty:
            return jsonify({"error": f"No reports found for {county}"}), 404

    # Handle no matching results
    if filtered_df.empty:
        return jsonify({"error": "No reports found matching the criteria."}), 404

    return filtered_df.to_json(orient='records')


@app.route('/word-search', methods=['GET'])
def check_for_keywords():
    keyword = request.args.get('keyword')
    
    # Check if the keyword is not None
    if not keyword:
        return {"error": "Keyword parameter is missing."}, 400

    # Use .str.contains() for substring matching
    mask = bigfoot_data['observed'].str.contains(keyword, na=False, case=False)

    # Filter the DataFrame and convert to JSON
    filtered_data = bigfoot_data[mask]
    return filtered_data.to_json(orient='records')


# Run Flask App
if __name__ == '__main__':
    app.run(debug=True)