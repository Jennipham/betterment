const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('./models/user');
const Profile = require('./models/profiles');
const ManagerProfile = require('./models/managerProfiles');
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
        const token = jwt.sign({ userId: newUser._id, userType: newUser.userType, email:newUser.email, }, secretKey, { expiresIn: '1h' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            firstName: newUser.fname,
            lastName: newUser.sname,
            userType: newUser.userType,
            email: newUser.email,

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
            const token = jwt.sign({ userId: user._id, email: user.email, userType: user.userType }, secretKey, { expiresIn: '1h' });
            res.status(200).json({
                loggedIn: true,
                token,
                firstName: user.fname,
                lastName: user.sname,
                userType: user.userType,
                email: user.email,
            });
        } else {
            res.status(401).json({ loggedIn: false, error: 'Incorrect password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/getProfile', async (req, res) => {
    try {
        const { email, userType } = req.body; // Use req.user to get the user information

        const profile = await Profile.findOne({ email });

        if (!profile) {
            console.log('Profile not found for email:', email);
            const defaultProfile = {
                email: email,
                userType: '',
                profileInfo: {
                    jobRole: '',
                    department: '',
                    capacity: '1',
                    officeLocation: '',
                    languages: [],
                    developmentAreas: [],
                    mentoringMethods: [],
                    sentRequests: [],
                    receivedRequests: [],
                    matchedUp: false,
                },
            };

            // Sign a token with default values
            const token = jwt.sign(
                { userId: '', email, userType: '' }, // Use email directly from req.user
                secretKey,
                { expiresIn: '1h' }
            );

            return res.json({
                profile: defaultProfile,
                token,
                email,
                userType: '',
            });
        }

        const token = jwt.sign(
            { userId: profile._id, email: profile.email, userType: profile.userType },
            secretKey,
            { expiresIn: '1h' }
        );

        res.json({
            profile,
            token,
            email: profile.email,
            userType: profile.userType,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/getManagerProfile', async (req, res) => {
    try {
        const { email, userType } = req.body; // Use req.user to get the user information

        const profile = await ManagerProfile.findOne({ email });

        if (!profile) {
            console.log('Profile not found for email:', email);
            const defaultProfile = {
                email: email,
                userType: '',
                profileInfo: {
                   domain: '',
        department: '',
        officeLocation: '',
        mentoringMethods: [],
        blindMatching: '', 
                },
            };

            // Sign a token with default values
            const token = jwt.sign(
                { userId: '', email, userType: '' }, // Use email directly from req.user
                secretKey,
                { expiresIn: '1h' }
            );

            return res.json({
                profile: defaultProfile,
                token,
                email,
                userType: '',
            });
        }

        const token = jwt.sign(
            { userId: profile._id, email: profile.email, userType: profile.userType },
            secretKey,
            { expiresIn: '1h' }
        );

        res.json({
            profile,
            token,
            email: profile.email,
            userType: profile.userType,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/profile', async (req, res) => {
    const { jobRole, department, officeLocation, capacity, languages, developmentAreas, mentoringMethods, email, userType, sentRequests, receivedRequests, matchedUp } = req.body;

    try {
        let profile = await Profile.findOne({ email });

        if (!profile) {
            // Create a new profile if it doesn't exist
            profile = new Profile({
                email: email,
                userType: userType,
                profileInfo: {
                    jobRole,
                    department,
                    capacity,
                    officeLocation,
                    languages,
                    developmentAreas,
                    mentoringMethods,
                    sentRequests,
                    receivedRequests,
                    matchedUp,
                },
            });
        } else {
            // Update existing profile
            profile.profileInfo = {
                jobRole,
                department,
                officeLocation,
                capacity,
                languages,
                developmentAreas,
                mentoringMethods,
                sentRequests,
                receivedRequests,
                matchedUp,
            };
        }

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/getUserDetails', async (req, res) => {
    const { email } = req.query;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (user) {
            // Send the user details in the response
            res.json({ user });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getRandomMentorProfile', async (req, res) => {
    try {
        const mentorProfiles = await Profile.find({ userType: 'mentor' });
        if (mentorProfiles.length === 0) {
            return res.status(404).json({ error: 'No mentor profiles found' });
        }

        const randomMentorProfile = mentorProfiles[Math.floor(Math.random() * mentorProfiles.length)];
        res.json({ profile: randomMentorProfile });
    } catch (error) {
        console.error('Error fetching random mentor profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/requestMatch', async (req, res) => {
    const { senderEmail, receiverEmail } = req.body;

    try {
        // Update sender's sentRequests
        await Profile.findOneAndUpdate(
            { email: senderEmail },
            { $addToSet: { 'profileInfo.sentRequests': receiverEmail } }
        );

        // Update receiver's receivedRequests
        await Profile.findOneAndUpdate(
            { email: receiverEmail },
            { $addToSet: { 'profileInfo.receivedRequests': senderEmail } }
        );

        res.json({ success: true, message: 'Match request sent successfully.' });
    } catch (error) {
        console.error('Error sending match request:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.post('/managerProfile', async (req, res) => {
    const { domain, department, officeLocation, mentoringMethods, blindMatching, email, userType, } = req.body;

    try {
        let profile = await ManagerProfile.findOne({ email });

        if (!profile) {
            // Create a new profile if it doesn't exist
            profile = new ManagerProfile({
                email: email,
                userType: userType,
                profileInfo: {
                    domain,
                    department,
                    officeLocation,
                    mentoringMethods,
                    blindMatching,
                },
            });
        } else {
            // Update existing profile
            profile.profileInfo = {
                domain,
                department,
                officeLocation,
                mentoringMethods,
                blindMatching,
            };
        }

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/send-form', async (req, res) => {
    const { formMessage } = req.body;
    const tokenHeader = req.headers.authorization;

    if (!tokenHeader) {
        res.status(401).json({ error: 'Authorization header is missing' });
        return;
    }
    const token = tokenHeader.split(' ')[1];

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'betterment.fyp@gmail.com',
            pass: contactPass,
        },
    });

    try {
        const decoded = jwt.verify(token, secretKey);
        const userEmail = decoded.email;

        const mailOptions = {
            from: 'betterment.fyp@gmail.com',
            to: 'jxp100@student.bham.ac.uk',
            subject: 'Help Form Submission',
            text: `User Email: ${userEmail}\n\nForm Message:\n${formMessage}`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('Form submitted successfully!');
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).send('Failed to submit form. Please try again later.');
    }
});

router.post('/logout', async (req, res) => {
    const tokenHeader = req.headers.authorization;
    
    if (!tokenHeader) {
        res.status(401).json({ error: 'Authorization header is missing' });
        return;
    }

    const token = tokenHeader.split(' ')[1];


    try {
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.userId;
        await User.findByIdAndUpdate(userId, { isLoggedOut: true });

        // You can also add the token to a blacklist here if needed

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});



module.exports = router;
