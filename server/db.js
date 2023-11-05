require('dotenv').config();
const mongoose = require('mongoose');

console.log(process.env.REACT_APP_URI);
const uri = process.env.REACT_APP_URI;
mongoose.connect(uri);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Database');
});
