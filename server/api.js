const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('./models/user');
const Profile = require('./models/profiles');
const ManagerProfile = require('./models/managerProfiles');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator'); // For input validation
const matchingController = require('./controllers/matching');


require('dotenv').config();

const secretKey = process.env.JWT_SECRET;
const saltRounds = 10; 

const contactPass = process.env.CONTACT_PASS;

const blacklist = new Set();

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
                    acceptedRequests: [],
                    matchedUp: 'false',
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
    const { jobRole, department, officeLocation, capacity, languages, developmentAreas, mentoringMethods, email, userType, sentRequests, receivedRequests, acceptedRequests,
 matchedUp } = req.body;

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
                    acceptedRequests,
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
                acceptedRequests,
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

router.get('/getRandomMenteeProfile', async (req, res) => {
    try {
        const menteeProfiles = await Profile.find({ userType: 'mentee' });
        if (menteeProfiles.length === 0) {
            return res.status(404).json({ error: 'No mentor profiles found' });
        }

        const randomMenteeProfile = menteeProfiles[Math.floor(Math.random() * menteeProfiles.length)];
        res.json({ profile: randomMenteeProfile });
    } catch (error) {
        console.error('Error fetching random mentee profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/getMatches', async (req, res) => {
    try {
        const matches = await matchingController.performMatching();
        res.json({ matches });
    } catch (error) {
        console.error('Error performing matching:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/requestMatch', async (req, res) => {
    const { senderEmail, receiverEmail, expiration } = req.body;

    try {
        // Check if the match request already exists
        const senderProfile = await Profile.findOne({ email: senderEmail });
        if (senderProfile && senderProfile.profileInfo.sentRequests.some(request => request.receiverEmail === receiverEmail)) {
            return res.status(400).json({ error: 'Match request already sent' });
        }

        const receiverProfile = await Profile.findOne({ email: receiverEmail });

        if (!senderProfile || !receiverProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Update sender's sentRequests and receiver's receivedRequests
        senderProfile.profileInfo.sentRequests.push({ receiverEmail, expiration });
        receiverProfile.profileInfo.receivedRequests.push({ senderEmail, expiration });

        // Save the changes to the database
        await senderProfile.save();
        await receiverProfile.save();

        res.json({ success: true, message: 'Match request sent successfully' });
    } catch (error) {
        console.error('Error sending match request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/getReceivedRequests', async (req, res) => {
    const { email, userType } = req.body;

    try {
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const receivedRequestsEmails = profile.profileInfo.receivedRequests || [];
        const receivedRequests = await Promise.all(
            receivedRequestsEmails.map(async (requestEmail) => {
                const user = await User.findOne({ email: requestEmail });
                if (user) {
                    return {
                        email: user.email,
                        firstName: user.fname,
                        lastName: user.sname,
                    };
                }
                return null;
            })
        );

        res.json({ receivedRequests });
    } catch (error) {
        console.error('Error getting received requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}); 

router.post('/getSentRequests', async (req, res) => {
    const { email, userType } = req.body;

    try {
        // Fetch user profile from the database
        const userProfile = await Profile.findOne({ email });

        if (!userProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Extract sentRequests from the user's profile
        const sentRequests = userProfile.profileInfo.sentRequests || [];

        // Return sentRequests directly without modifying expirationDate
        res.json({ sentRequests });
    } catch (error) {
        console.error('Error fetching sent requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete('/cancelRequest/:receiverEmail', async (req, res) => {
    const { email } = req.body;
    const { receiverEmail } = req.params;

    try {
        // Find the profile and remove the canceled request from sentRequests
        const profile = await Profile.findOneAndUpdate(
            { email },
            { $pull: { 'profileInfo.sentRequests': { receiverEmail: receiverEmail } } },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const receiverProfile = await Profile.findOneAndUpdate(
            { 'profileInfo.receivedRequests.senderEmail': email },
            { $pull: { 'profileInfo.receivedRequests': { senderEmail: email } } },
            { new: true }
        );

        if (!receiverProfile) {
            return res.status(404).json({ error: 'Receiver profile not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error canceling request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
        // Check if the token is in the blacklist
        if (blacklist.has(token)) {
            res.status(401).json({ error: 'Token is already invalidated' });
            return;
        }

        // Verify the token
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.userId;

        // Add the token to the blacklist
        blacklist.add(token);

        // Invalidate the token on the client side
        // You can also set an expiration date in the past to make it immediately invalid
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});


module.exports = router;
