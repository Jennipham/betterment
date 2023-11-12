const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('./models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator'); // For input validation

require('dotenv').config();

const secretKey = process.env.JWT_SECRET;
const saltRounds = 10; 

const contactPass = process.env.CONTACT_PASS;


router.post('/signup', async (req, res) => {
    try {
        const { fname, sname, email, password, userType } = req.body;

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Generate a salt and hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            fname,
            sname,
            email,
            password: hashedPassword,
            userType,
        });

        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, secretKey, { expiresIn: '1h' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            firstName: newUser.fname,
            lastName: newUser.sname,
            userType: newUser.userType,

        });
    } catch (error) {
        console.error('Error during registration:', error);
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
        console.error('Error checking email:', error);
        res.status(500).json({ error: 'Error checking email' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ loggedIn: false, error: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, { expiresIn: '1h' });
            res.status(200).json({
                loggedIn: true,
                token,
                firstName: user.fname,
                lastName: user.sname,
                userType: user.userType,
            });
        } else {
            res.status(401).json({ loggedIn: false, error: 'Incorrect password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/send-form', async (req, res) => {
    const { formMessage } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);

    const userEmail = decoded.email;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'betterment.fyp@gmail.com', 
            pass: contactPass, 
        },
    });

    const mailOptions = {
        from: 'betterment.fyp@gmail.com',
        to: 'jxp100@student.bham.ac.uk',
        subject: 'Help Form Submission',
        text: `User Email: ${userEmail}\n\nForm Message:\n${formMessage}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Form submitted successfully!');
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).send('Failed to submit form. Please try again later.');
    }
});


module.exports = router;
