const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
    },
    sname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
    },

});

// Create a User model based on the user schema
const User = mongoose.model('Users', userSchema,'User');

module.exports = User;
