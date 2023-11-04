const express = require('express');
const router = express.Router(); // Create an Express router
const User = require('./models/user'); // Import your User model

// Define a route for user registration
router.post('/signup', async (req, res) => {
    try {
        const { fname, sname, email, password, userType } = req.body;

        // Create a new user instance
        const newUser = new User({ fname, sname, email, password, userType });

        // Save the new user to the database
        await newUser.save();

        res.status(200).json({ message: 'User registration successful' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'User registration failed' });
    }
});

module.exports = router; // Export the router for use in your main app.js file
