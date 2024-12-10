const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all origins (you can restrict it later for security)
app.use(cors());

// Provide the correct path to your database
const dbPath = path.join(__dirname, 'bigfoot_population.db');
// const dbPath = path.join(__dirname, 'C:/Users/ah230/Downloads/DABC/Class Folder/New Project 3/bigfoot-sightings/notebooks/bigfoot_population.db');
const db = new sqlite3.Database(dbPath);

// Define the API route
app.get('/api/bigfoot-population', (req, res) => {
    console.log("get is happening");
    const query = `
        SELECT *
        FROM bigfoot_population
    `;

    // Execute the query and handle the result
    db.all(query, (err, rows) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('Database error');
        } else {
            console.log('Query returned rows:', rows); // Log the rows to ensure data is returned
            res.json(rows); // Send the rows as JSON response
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
