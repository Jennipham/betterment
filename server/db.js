require('dotenv').config();
const mongoose = require('mongoose');
console.log(process.env.TEST_VARIABLE);

console.log(process.env.URI);
const uri = process.env.URI;
mongoose.connect(uri);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Database');
});
