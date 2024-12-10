# Air B&Bigfoot

This project utalizes the longest running Bigfoot sighting database to create an interactive map of American sightings.

**Link to project**: [Where's Bigfoot been?](https://the-eva-a.github.io/bigfoot-sightings/)

## What We've Made
**Tech Used:** Python, Javascript
**Libraries Used**:

[Pitch the product here]

[Go over Features]
- Large database the Bigfoot Research Organization[BFRO](https://www.bfro.net) dates back to [1955](https://www.bfro.net/gdb/classify.asp) and has over five tousand entries giving a rich dataset to look through. 
- Location is based on report details or data extracted from the overall report
- 
## How We Did It
### Data Retrieval 
Our journey began at the global Bigfoot database, which conveniently provided links to every state page. From there, we scraped each state page to gather all county links, and finally, we visited each county page to retrieve detailed report data.

The scraping process took about an hour to complete, during which we used logging to track our progress through thousands of pages. Relevant data, such as the year, season, state, county, and nearest road, was stored in neatly organized div tags, making the extraction process relatively smooth.

In total, we pulled 5,153 reports into a JSON file called `raw_scraping_data.json`. This file contains raw data as dictionaries for each report, preserving the original structure for future cleaning and analysis. While some reports failed to load, the scale and scope of our collection gave us a rich dataset to work with.
### Data Preperation
Data Preparation

To prepare the data for analysis, we started by loading the raw_scraping_data.json file into a pandas DataFrame. We made several adjustments to ensure consistency and usability:

    Column Standardization: All column names were converted to lowercase and formatted with underscores for consistency and ease of use.
    Date Cleaning: Rows with vague or missing date entries (e.g., "late 90s" or NaN) were dropped, and a cleaned date_cleaned column was created for valid four-digit year entries.
    Text and Field Normalization: Fields like report_number and report_class were transformed to extract consistent values, while columns like environment were standardized to lowercase for uniformity.

Thanks to the meticulous structure of the Bigfoot database, no major outliers or invalid entries were present, and all rows included the required fields: year, state, county, and report number. This streamlined the cleaning process, allowing us to focus on deeper analysis and enrichment in subsequent steps.
## Lessons Learned
This project reinforced several key lessons about data collection and analysis:  
- **The Value of Quality Data**: The Bigfoot database was well-maintained, which minimized the effort needed for cleaning and allowed us to focus on analysis.  
- **The Power of Automation**: Automating our scraping process with logging ensured efficiency and provided clear progress tracking.  
- **The Importance of Consistency**: Consistent formatting in the dataset (e.g., standardized `div` tags) demonstrated how clear data structure reduces preprocessing effort.  
- **Handling Missing Information**: Deciding to drop vague date entries while keeping placeholders for other missing values helped maintain data integrity without compromising analysis.  

## Acknowledgements
