const express = require('express');
const router = express.Router();
const User = require('./models/user');

router.post('/signup', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.get('/check-email', async (req, res) => {
    const { email } = req.query;

    try {
        const user = await User.findOne({ email });

        if (user) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error checking email' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if a user with the provided email and password exists in the database
        const user = await User.findOne({ email, password });

        if (user) {
            res.status(200).json({ loggedIn: true });
        } else {
            res.status(401).json({ loggedIn: false });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;