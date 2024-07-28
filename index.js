//July 29 2024 ( monday )


const express = require('express'); // Import the Express framework
const axios = require('axios');     // Import Axios for making HTTP requests
const fs = require('fs');           // Import the File System module for file operations
const { parse } = require('json2csv'); // Import the json2csv library for converting JSON to CSV
const path = require('path');       // Import the Path module for handling and transforming file paths

const app = express();              // Create an instance of an Express application
const port = 3000;                  // Define the port on which the server will listen

/**
 * Fetch data from a specified API endpoint.
 *
 * @param {number} numRequests - The number of requests to make to the API.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of API responses.
 */
async function fetchData(numRequests) {
    const url = 'https://bored-api.appbrewery.com/random'; // API endpoint for fetching random activity suggestions
    const responses = []; // Array to store API responses

    // Loop to make multiple API requests
    for (let i = 0; i < numRequests; i++) {
        try {
            const response = await axios.get(url); // Make a GET request to the API
            responses.push(response.data); // Store the response data
        } catch (error) {
            console.error('Error fetching data:', error.message); // Log any errors encountered during the request
        }
    }

    return responses; // Return the collected responses
}

/**
 * Route handler for the '/fetch' endpoint.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/fetch', async (req, res) => {
    const numRequests = parseInt(req.query.num, 10); // Extract the number of requests from query parameters
    const format = req.query.format; // Extract the desired response format from query parameters

    // Validate the input parameters
    if (!Number.isInteger(numRequests) || numRequests <= 0 || !format) {
        return res.status(400).send('Please provide a valid num and format query parameter.');
    }

    try {
        const data = await fetchData(numRequests); // Fetch the data from the API
        let filePath;

        // Handle different output formats
        if (format === 'json') {
            filePath = path.join(__dirname, 'output.json'); // Define the path for the JSON output file
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4)); // Write the data to the file
            res.download(filePath, () => fs.unlinkSync(filePath)); // Send the file to the client and remove it afterward
        } else if (format === 'csv') {
            const csv = parse(data); // Convert the data to CSV format
            filePath = path.join(__dirname, 'output.csv'); // Define the path for the CSV output file
            fs.writeFileSync(filePath, csv); // Write the CSV data to the file
            res.download(filePath, () => fs.unlinkSync(filePath)); // Send the file to the client and remove it afterward
        } else if (format === 'console') {
            console.log(data); // Print the data to the server console
            res.send('Data printed to console.'); // Send a response indicating the data was printed
        } else {
            res.status(400).send('Invalid format. Use "json", "csv", or "console".'); // Handle invalid format input
        }
    } catch (error) {
        console.error('Error:', error.message); // Log any errors encountered during the process
        res.status(500).send('Error fetching data.'); // Send a response indicating a server error
    }
});

// Start the server and listen for incoming requests
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`); // Log a message indicating that the server is running
});
