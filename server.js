const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all origins (you can restrict it later for security)
app.use(cors());

// Provide the correct path to your database
const dbPath = path.join(__dirname, 'C:/Users/ah230/Downloads/DABC/Class Folder/New Project 3/bigfoot-sightings/notebooks/bigfoot_population');
const db = new sqlite3.Database(dbPath);

// Define the API route
app.get('/api/bigfoot-population', (req, res) => {
    // Ensure we query for report count per state
    const query = `
        SELECT state, COUNT(*) AS report_count, POPESTIMATE2023
        FROM bigfoot_population
        GROUP BY state, POPESTIMATE2023
        ORDER BY report_count DESC
    `;

    // Execute the query and handle the result
    db.all(query, (err, rows) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Check if the query returned data
        if (rows.length === 0) {
            console.log('No data found');
            return res.status(404).json({ error: 'No data found' });
        }

        // Log the rows for debugging purposes
        console.log('Query returned rows:', rows); // Log rows to console

        // Send the rows as JSON response
        res.json(rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

