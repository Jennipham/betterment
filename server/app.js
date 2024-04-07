const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const app = express();
const db = require('./db');
const api = require('./api');

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to your application!');
});

app.use('/', api);

const options = {
    key: fs.readFileSync('./certs/localhost.key'),
    cert: fs.readFileSync('./certs/localhost.crt')
};

const port = process.env.PORT || 3001;

https.createServer(options, app).listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`);
});