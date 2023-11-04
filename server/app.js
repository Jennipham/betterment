const express = require('express');
const cors = require('cors'); // Import the cors middleware
const bodyParser = require('body-parser');
const app = express();
const db = require('./db');
const api = require('./api');

app.use(cors()); // Enable CORS for all routes

app.use(bodyParser.json());

app.use('/', api);

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
