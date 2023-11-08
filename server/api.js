const express = require('express');
const router = express.Router();
const User = require('./models/user');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const secretKey = process.env.JWT_SECRET;
const verifyToken = require('./authMiddleware');

const bcrypt = require('bcrypt');
const saltRounds = 10; // You can adjust the number of salt rounds for security

router.post('/signup', async (req, res) => {
    try {
        const { fname,sname, email, password, userType } = req.body;

        // Generate a salt and hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user with the hashed password
        const newUser = new User({
            fname,
            sname,
            email,
            password: hashedPassword,
            userType,
    
        });

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
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ loggedIn: false }); // User not found
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
            res.status(200).json({ loggedIn: true, token }); // Passwords match, user is logged in
        } else {
            res.status(401).json({ loggedIn: false }); // Passwords do not match
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});


module.exports = router;