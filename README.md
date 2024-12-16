# Air B&Bigfoot

This project utilizes the longest-running Bigfoot sighting database to create an interactive map of American sightings.

**Link to project**: [Where's Bigfoot Been?](https://the-eva-a.github.io/bigfoot-sightings/)

## Overview

Air B&Bigfoot combines reports from the oldest and only scientific Bigfoot research group with advanced data scraping, cleaning, and visualization techniques. This project showcases an organized dataset, a Flask API for serving the data, and an interactive JavaScript map that brings the legend of Bigfoot to life.

## What We've Made
**Tech Used:**
- **Languages:** Python, JavaScript  
- **Libraries:** Pandas, Beautiful Soup, Flask, Leaflet.js, Chart.js

**Features:**
- **Interactive Map:** Explore Bigfoot sightings with filters for year and classification.  
- **Data Transparency:** All report data is linked directly to the [Bigfoot Research Organization (BFRO)](https://www.bfro.net).  
- **Dynamic Details:** Clickable markers reveal the report number, classification, location, year, and a link to the original report.
- **Data Dashboard:** Filter and view report data within a specific timeframe or loaction, and see a snapshot of descriptive statistics about the reports
- **Powerful API:** The included Flask API enables programmatic access to the dataset, allowing users to:
  - Retrieve all records or a subset of records based on parameters such as year, state, or classification.
  - Access detailed metadata for individual reports.
  - Integrate Bigfoot sightings data into their own projects or analysis pipelines.
This project invites users to dive into the history and mystery of Bigfoot sightings, presenting data in an accessible and engaging way.

This project invites users to dive into the history and mystery of Bigfoot sightings, presenting data in an accessible and engaging way.
Features

- **Extensive Database:** The [Bigfoot Research Organization (BFRO)](https://www.bfro.net/) has been compiling reports since [1955](https://www.bfro.net/gdb/classify.asp), resulting in a dataset with over 5,000 detailed entries. This rich collection provides ample opportunities for exploration and analysis.

- **Interactive Visualization**: The project transforms this extensive database into an intuitive map, where users can filter sightings by year or classification and access detailed information about each report.

- **Direct Data Access:** Every map marker links back to the original BFRO report, allowing users to delve deeper into the specifics of individual sightings.
## How To Use 
### Interactive Map
1. **Access the Map:** 

    Visit the interactive map at [Where's Bigfoot Been?](https://the-eva-a.github.io/bigfoot-sightings/).

2. **Explore Sightings:** 
    - Use the zoom and pan features to navigate the map.
    - Click on any mark to see details about a specific Bigfoot sighting, including:
        - Report number
        - Report classification (e.g., Class A, B, or C)
        - Year of the sighting
        - Location details
        - A link to the original BFRO report
3. **Filter Sightings:** 
    - Use the filter options to narrow sightings by year or classification. 
    - Clear filters to return to the full dataset

### Interactive Report Dashboard
1. **Access the Dashboard:**

     Visit the interactive dashboard at https://the-eva-a.github.io/bigfoot-sightings/dashboard.html
2. **Explore report information:**
    - Filter by timeframe and state, or leave either option unfiltered
    - View counts of: overall sightings, sightings by class, sightings by season
    - See a chart containing all of the relevant report details
---
### API Access
To access the data programmatically, follow these steps:
1. **Run the API Locally:** 
    ``` bash
    git clone https://github.com/the-eva-a/bigfoot-sightings.git
    cd bigfoot-sightings
    ```

2. **Install Dependencies:**

    Ensure you have Python installed. Then, install the required Python packages:

    ```
    pip install -r requirements.txt
    ```
3. **Run the Flask API:**
    
    Start the API locally:
    ```
    flask_app/main.py
    ```
    The API will run at `http://127.0.0.1:5000/`

For more information on the Flask API go [API README](flask_app/README.md)
---

## How We Did It
### Data Retrieval 
Our journey began at the global Bigfoot database, which conveniently provided links to every state page. From there, we scraped each state page to gather all county links, and finally, we visited each county page to retrieve detailed report data.

The scraping process took about an hour to complete, during which we used logging to track our progress through thousands of pages. Relevant data, such as the year, season, state, county, and nearest road, was stored in neatly organized div tags, making the extraction process relatively smooth.

In total, we pulled 5,153 reports into a JSON file called `raw_scraping_data.json`. This file contains raw data as dictionaries for each report, preserving the original structure for future cleaning and analysis. While some reports failed to load, the scale and scope of our collection gave us a rich dataset to work with.
### Data Preperation
Data Preparation

To prepare the data for analysis, we started by loading the raw_scraping_data.json file into a pandas DataFrame. We made several adjustments to ensure consistency and usability:

- **Column Standardization:** 
All column names were converted to lowercase and formatted with underscores for consistency and ease of use.
- **Date Cleaning:**
Rows with vague or missing date entries (e.g., "late 90s" or NaN) were dropped, and a cleaned date_cleaned column was created for valid four-digit year entries.
- **Text and Field Normalization:** Fields like report_number and report_class were transformed to extract consistent values, while columns like environment were standardized to lowercase for uniformity.

Thanks to the meticulous structure of the Bigfoot database, no major outliers or invalid entries were present, and all rows included the required fields: year, state, county, and report number. This streamlined the cleaning process, allowing us to focus on deeper analysis and enrichment in subsequent steps.
### Visualization & Map Creation
We utilized Leaflet.js for the map framework and MarkerClusterGroup for handling the large number of markers. The map layers were created for different map types, such as StreetMap and OpenTopoMap, and users could interactively switch between these layers.

To make the map even more intuitive, we used custom SVG icons for markers that represent different Bigfoot sighting classifications. The icons were created with dynamic colors and an overlay of an image of Bigfoot (sourced from The Noun Project), which was combined with an SVG oval background. The icons change color based on the classification (green for Class A, orange for Class B, and red for Class C).

For the creation of these custom SVG icons, we used code adapted from the guide found on One Step Code. This allowed us to craft markers that visually communicate the classification of each sighting, improving the user experience.

Each marker on the map is interactive: clicking a marker reveals the report number, classification, location, year, and a link to the original report on the BFRO website. The map also includes a legend that visually shows the relationship between marker colors and report classifications.
## Lessons Learned
This project reinforced several key lessons about data collection and analysis:  
- **The Value of Quality Data**: The Bigfoot database was well-maintained, which minimized the effort needed for cleaning and allowed us to focus on analysis.  
- **The Power of Automation**: Automating our scraping process with logging ensured efficiency and provided clear progress tracking.
- **Building an Intuitive API:** Developing the Flask API highlighted the importance of clean and consistent endpoints. By structuring our API to allow for filtering by year, state, and report details, we made the dataset more accessible to users and other applications.
-** Interactive Visualizations Matter:** Creating the JavaScript map with Leaflet.js underscored the importance of user experience. Features like clickable markers, filtering options, and integration with the BFRO database provided an engaging way for users to explore sightings.  
- **The Importance of Consistency**: Standardizing data formats and ensuring uniformity across all processes—whether in Python scripts, the Flask API, or JavaScript code—reduced errors and streamlined the workflow.
- **Handling Missing and Ambiguous Information:** While some reports lacked precise details (e.g., vague date entries or ambiguous locations), we ensured that critical fields like year, state, and county were preserved. Placeholder values allowed us to maintain the dataset's integrity without compromising functionality.
### Ethics

Working with the Bigfoot dataset presented unique challenges and opportunities, especially given the cultural and folkloric nature of the subject. Our team approached this project with respect for the data, the contributors, and the Bigfoot community. Below, we detail the steps taken to ensure ethical handling of the dataset:

1. **Source Credibility:**

    The dataset is based on reports of an unproven creature, which inherently presents challenges in reliability. We chose the Bigfoot Research Organization (BFRO) as our data source because it is a longstanding and reputable organization in this space. The BFRO has a history of consistent record-keeping and well-described standards for classification and reporting, which provided a strong foundation for our project.

2. **Respect for the Community:**
    While none of our team members identify as Bigfoot believers, we wanted to ensure that our project did not mock or dismiss the experiences of those who do. We made a conscious effort to present the data in a neutral, factual manner, avoiding exaggerations or dismissive language. Our goal was to remain open-minded and to treat the subject with curiosity and respect.

3. **Data Privacy and Geolocation:**
    The BFRO is careful to handle identifiable details in accordance with the wishes of those who submit reports. Our project relied entirely on the data as published by the BFRO, and we made no additional effort to collect or reveal personal information. Furthermore, the dataset does not include precise geolocation data but instead relies on generalized location descriptors (e.g., county or nearest town). As such, there are no concerns about exposing sensitive or private information.

4. **Data Integrity:**
    We performed minimal changes to the data, restricting our modifications to standard cleaning processes, such as standardizing column names, correcting vague dates, and removing incomplete entries. All reports were pulled directly from the BFRO website, and the data remains true to its original format. However, we acknowledge the inherent limitations of the dataset—such as subjective classifications and incomplete reports—and have noted these limitations in our documentation.

5. **Attribution and Collaboration:**
    We have properly attributed the BFRO as the source of the data and have also informed the organization about our project. The BFRO imposes no restrictions on the use of their data, allowing us to build and share our project freely while maintaining transparency about its origins.

Through these considerations, we have aimed to balance scientific curiosity, cultural sensitivity, and ethical responsibility. Our project not only highlights the intriguing history of Bigfoot sightings but also serves as a reminder of the importance of respectful and thoughtful engagement with any dataset.

## Contributors
- Eva Anderson [github](https://github.com/the-eva-a)
- Kelsie Bumadianne [github](https://github.com/kbumadianne)
- Heather Eby [github](https://github.com/ebyheather)
- Abigail Husain [github](https://github.com/ahusain718)
