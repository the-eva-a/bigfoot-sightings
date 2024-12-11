# Dependencies
import requests
from bs4 import BeautifulSoup
import logging
import pandas as pd
import json
import matplotlib.pyplot as plt
import googlemaps
import pandas as pd
from dotenv import load_dotenv
import os

# Obtain environment variables
load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

# Initalize the Google Maps API Client
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

# Load the data we have
bigfoot_data = pd.read_json('../data/raw_scraping_data.json')

# Configure logging
logging.basicConfig(
    filename='notebooks/logs/bigfoot_updates.log',  # Log file name
    filemode='a',  # Append mode
    level=logging.DEBUG,  # Log everything from DEBUG and above
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Bring over Functions 
def soupify_website(url):
    """
    Fetches the HTML content of a given URL and parses it into a BeautifulSoup object.

    Parameters:
        url (str): The URL of the webpage to be scraped.

    Returns:
        BeautifulSoup: A BeautifulSoup object representing the parsed HTML of the webpage.
    
    Raises:
        ValueError: If the HTTP response status is not 200(OK)
    """
    
    # test connection
    response = requests.get(url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        return soup
    else:
        raise ValueError(f"Failed to fetch {url}: Status code {response.status_code}")

def get_report_links():
    """
    Extracts all report numbers from links from the Sighting Reports Recently Added page of the BFRO
    database. 

    Parameters:
        report_soup: A list of BeautifulSoup objects to search for links.

    Returns:
        list: A list of hyperlink strings (`href` values) extracted from the provided BeautifulSoup objects.
    
    Notes:
        - Only links with an `href` attribute will be included.
        - Duplicate links are not removed; the returned list may contain duplicates.
    """
    link_list = []
    report_soup = soupify_website('https://www.bfro.net/GDB/newadd.asp?Show=AB')
    links = report_soup.find_all('a')
    for link in links:
        if link.get('href') and 'show_report.asp?id=' in link.get('href') :
            url = link.get('href').split('show_report.asp?id=')[1]
            link_list.append(url)
    return link_list

def create_sighting_dictionary(url):
    """
    Extracts information from an individual report page and returns it as a dictionary.

    Parameters:
        url (str): The URL of the report page.

    Returns:
        dict: A dictionary with the extracted information, or None if the page cannot be parsed.
    """
    logging.info(f"Fetching report from: {url}")
    report = soupify_website(url)

    if not report:
        logging.error(f"Failed to parse report page: {url}")
        return None

    try:
        report_dict = {}

        # Extract 'Report Number'
        report_header = report.find('span', class_='reportheader')
        report_dict['Report Number'] = report_header.text.strip() if report_header else 'N/A'

        # Extract 'Report Classification'
        report_class = report.find('span', class_='reportclassification')
        report_dict['Report Class'] = report_class.text.strip() if report_class else 'N/A'

        # Extract additional fields
        fields = report.find_all('span', class_='field')
        for field in fields:
            # Get the full text of the parent element
            text = field.parent.text.strip()

            # Only process fields in the format "Header: Value"
            if ':' in text:
                # Split into field name and value
                field_name, value = text.split(':', 1)

                # Clean up field name and value
                field_name = field_name.strip().lower()
                value = value.strip()

                # Validate input (ensure no line breaks in the value)
                if len(value.split('\n')) == 1:
                    # Store the field and value in the dictionary
                    report_dict[field_name] = value

        return report_dict

    except Exception as e:
        logging.error(f"Error processing report {url}: {e}")
        return None
    
