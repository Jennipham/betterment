const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const User = require('./models/user');
const MenteeProfile = require('./models/menteeProfiles');
const MentorProfile = require('./models/mentorProfiles');
const ManagerProfile = require('./models/managerProfiles');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const galeShapley = require('./controllers/matching');
const moment = require('moment');

require('dotenv').config();

const secretKey = process.env.JWT_SECRET;
const saltRounds = 10;

const contactPass = process.env.CONTACT_PASS;

const blacklist = new Set();

const updateAdminForProfilesWithDomain = async (domain, adminEmail) => {
    // Update admin field for mentees
    await MenteeProfile.updateMany(
        { 'email': { $regex: new RegExp(`@${domain}$`, 'i') } },
        { $set: { 'profileInfo.admin': adminEmail } }
    );

    // Update admin field for mentors
    await MentorProfile.updateMany(
        { 'email': { $regex: new RegExp(`@${domain}$`, 'i') } },
        { $set: { 'profileInfo.admin': adminEmail } }
    );
};

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

        let newProfile;

        const emailParts = email.split('@');
        const domain = emailParts.length === 2 ? emailParts[1] : null;

        // Check user type and create the corresponding profile
        if (userType === 'admin') {
            newProfile = new ManagerProfile({
                email,
                userType,
                profileInfo: {
                    orgName: '',
                    matchingMethod: 'Algorithm',
                    blindMatching: 'On',
                },
            });

            if (domain) {
                await updateAdminForProfilesWithDomain(domain, email);
            }
        } else if (userType === 'mentee' || userType === 'mentor') {
            // Mentee/Mentor signup logic
            newProfile = userType === 'mentee'
                ? new MenteeProfile({ email, userType })
                : new MentorProfile({ email, userType });

            // Find corresponding admin from domain
            if (domain) {
                const adminProfile = await ManagerProfile.findOne({
                    email: { $regex: new RegExp(`@${domain}$`, 'i') },
                });

                if (adminProfile) {
                    newProfile.profileInfo.admin = adminProfile.email;
                }
            }
        }

        await newProfile.save();

        const token = jwt.sign(
            { userId: newUser._id, userType: newUser.userType, email: newUser.email },
            secretKey,
            { expiresIn: '1h' }
        );

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
            return res.status(404).json({ loggedIn: false, error: 'User not found' });
        }

        // Compare the password with the stored hashed password
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
        const { email, userType } = req.body;
        let profile, defaultProfile;

        if (userType === 'mentee') {
            profile = await MenteeProfile.findOne({ email });
            if (!profile) {
                console.log('Profile not found for email:', email);
                defaultProfile = {
                    email: email,
                    userType: '',
                    profileInfo: {
                        signUpDate: new Date(),
                        jobRole: '',
                        department: '',
                        capacity: '1',
                        officeLocation: '',
                        languages: [],
                        traits:[],
                        developmentAreas: [],
                        mentoringMethods: [],
                        sentRequests: [],
                        receivedRequests: [],
                        shortlistOrder: [],
                        available: 'true',
                        matchedInCurrentRound: false,
                        declinedRequestsCount: 0,
                        matches: [],
                        admin: '',

                    },
                };
            }
        }

        if (userType === 'mentor') {
            profile = await MentorProfile.findOne({ email });
            if (!profile) {
                console.log('Profile not found for email:', email);
                defaultProfile = {
                    email: email,
                    userType: '',
                    profileInfo: {
                        signUpDate: new Date(),
                        jobRole: '',
                        department: '',
                        capacity: '1',
                        level: '',
                        officeLocation: '',
                        languages: [],
                        traits:[],
                        developmentAreas: [],
                        mentoringMethods: [],
                        sentRequests: [],
                        receivedRequests: [],
                        shortlistOrder: [],
                        available: 'true',
                        matchedInCurrentRound: false,
                        declinedRequestsCount: 0,
                        matches: [],
                        admin: '',

                    },
                };
            }
        }

        profile = profile || defaultProfile;

        const token = jwt.sign(
            { userId: profile._id || '', email, userType: profile.userType || '' },
            secretKey,
            { expiresIn: '1h' }
        );

        res.json({
            profile,
            token,
            email,
            userType: profile.userType || '',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// If the attributes match, return 1
function calculateSimilarityScore(attribute1, attribute2) {
    return attribute1 === attribute2 ? 1 : 0;
}

// Function to calculate similarity score for two arrays
const calculateArraySimilarityScore = (array1, array2) => {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
        return 0;
    }

    const commonElements = array1.filter(element => array2.includes(element));
    return commonElements.length;
};
router.get('/getPotentialMatches', async (req, res) => {
    try {
        const { email, userType, language,traits, department, officeLocation, developmentAreas, mentoringMethods } = req.query;

        // Extract domain from the email
        const emailParts = email.split('@');
        const domain = emailParts.length === 2 ? emailParts[1] : null;

        if (!domain) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        let profiles;

        if (userType === 'mentee') {
            // Retrieve all mentor profiles with the same domain and available set to true
            profiles = await MentorProfile.find({
                'email': { $regex: new RegExp(`@${domain}$`, 'i') },
                'profileInfo.available': true
            });
        } else if (userType === 'mentor') {
            // Retrieve all mentee profiles with the same domain and available set to true
            profiles = await MenteeProfile.find({
                'email': { $regex: new RegExp(`@${domain}$`, 'i') },
                'profileInfo.available': true
            });
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        const currentUserEmail = email;
        const currentUserProfile = userType === 'mentee'
            ? await MenteeProfile.findOne({ email: currentUserEmail })
            : await MentorProfile.findOne({ email: currentUserEmail });

        if (currentUserProfile && currentUserProfile.profileInfo.matches.length > 0) {
            // The user is matched, find the corresponding profiles
            const matchedUserEmails = currentUserProfile.profileInfo.matches.map(match => userType === 'mentee' ? match.mentorEmail : match.menteeEmail);
            const matchedProfiles = userType === 'mentee'
                ? await MentorProfile.find({ email: { $in: matchedUserEmails } })
                : await MenteeProfile.find({ email: { $in: matchedUserEmails } });

            return res.json({ profiles: matchedProfiles, isMatch: true });
        }

        // Calculate similarity score and order profiles
        const profilesWithScores = profiles.map(profile => {
            const { _doc: { profileInfo } } = profile;

            let totalScore =
                calculateSimilarityScore(department, profileInfo.department) +
                calculateSimilarityScore(officeLocation, profileInfo.officeLocation) +
                calculateArraySimilarityScore(developmentAreas, profileInfo.developmentAreas) +
                calculateArraySimilarityScore(traits, profileInfo.traits) +
                calculateArraySimilarityScore(mentoringMethods, profileInfo.mentoringMethods);

            if (userType === 'mentee') {
                totalScore += profileInfo.level ? parseInt(profileInfo.level) : 0;
            }

            if (mentoringMethods === 'InPerson' && profileInfo.mentoringMethods === 'InPerson' && officeLocation === profileInfo.officeLocation) {
                totalScore += 2;
            }

            return { ...profile, score: totalScore };
        });

        const sortedProfiles = profilesWithScores.sort((a, b) => b.score - a.score);

        // Filter profiles based on common languages
        const filteredProfiles = sortedProfiles.filter(profile => {
            const profileLanguages = profile._doc.profileInfo.languages;

            const commonLanguages = profileLanguages && language && profileLanguages.filter(language =>
                language.includes(language)
            );

            return commonLanguages && commonLanguages.length > 0;
        });

        if (filteredProfiles.length === 0) {
            return res.status(404).json({ message: 'No matching profiles found' });
        }

        return res.json({ profiles: filteredProfiles, isMatch: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/getManagerProfile', async (req, res) => {
    try {
        const { email, userType } = req.body;
        let profile = await ManagerProfile.findOne({ email });

        let defaultProfile = {
            email,
            userType,
            profileInfo: {
                orgName: '',
                department: '',
                matchingMethod: '',
                blindMatching: '',
            },
        };

        if (!profile) {
            console.log('Profile not found for email:', email);
            profile = defaultProfile;
        }

        const token = jwt.sign(
            { userId: profile._id || '', email, userType: profile.userType || '' },
            secretKey,
            { expiresIn: '1h' }
        );

        return res.json({
            profile,
            token,
            email,
            userType: profile.userType || '',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.post('/profile', async (req, res) => {
    const { signUpDate, jobRole, department, officeLocation, capacity, languages,traits, level, developmentAreas, mentoringMethods, email, userType, sentRequests, receivedRequests, available, shortlistOrder, matchedInCurrentRound,
        declinedRequestsCount, matches, admin, } = req.body;

    try {
        let profile;

        if (userType === 'mentee') {
            profile = await MenteeProfile.findOne({ email });
            if (!profile) {
                // Create a new profile if it doesn't exist
                profile = new MenteeProfile({
                    email: email,
                    userType: userType,
                    profileInfo: {
                        signUpDate,
                        jobRole,
                        department,
                        capacity,
                        officeLocation,
                        languages,
                        traits,
                        developmentAreas,
                        mentoringMethods,
                        sentRequests,
                        receivedRequests,
                        shortlistOrder,
                        available,
                        matchedInCurrentRound,
                        declinedRequestsCount,
                        matches,
                        admin,
                    },
                });
            } else {
                // Update existing profile
                profile.profileInfo = {
                    signUpDate,
                    jobRole,
                    department,
                    officeLocation,
                    capacity,
                    languages,
                    traits,
                    developmentAreas,
                    mentoringMethods,
                    sentRequests,
                    receivedRequests,
                    shortlistOrder,
                    available,
                    matchedInCurrentRound,
                    declinedRequestsCount,
                    matches,
                    admin,

                };
            }
        } else if (userType === 'mentor') {
            profile = await MentorProfile.findOne({ email });
            if (!profile) {
                // Create a new profile if it doesn't exist
                profile = new MentorProfile({
                    email: email,
                    userType: userType,
                    profileInfo: {
                        signUpDate,
                        jobRole,
                        department,
                        officeLocation,
                        capacity,
                        level,
                        languages,
                        traits,
                        developmentAreas,
                        mentoringMethods,
                        sentRequests,
                        receivedRequests,
                        shortlistOrder,
                        available,
                        matchedInCurrentRound,
                        declinedRequestsCount,
                        matches,
                        admin,

                    },
                });
            } else {
                // Update existing profile
                profile.profileInfo = {
                    signUpDate,
                    jobRole,
                    department,
                    officeLocation,
                    capacity,
                    level,
                    languages,
                    traits,
                    developmentAreas,
                    mentoringMethods,
                    sentRequests,
                    receivedRequests,
                    shortlistOrder,
                    available,
                    matchedInCurrentRound,
                    declinedRequestsCount,
                    matches,
                    admin,

                };
            }
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
        // Find user by email
        const user = await User.findOne({ email });

        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getAdminMatchingSettings', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find the admin profile by email
        const adminProfile = await ManagerProfile.findOne({ email });

        if (!adminProfile) {
            return res.status(404).json({ error: 'Admin profile not found' });
        }

        // Retrieve blindMatching and matchingMethod from the admin profile
        const { blindMatching, matchingMethod } = adminProfile.profileInfo;

        res.json({ blindMatching, matchingMethod });
    } catch (error) {
        console.error('Error fetching admin matching settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getRandomMentorProfile', async (req, res) => {
    try {
        const { email } = req.query;

        // Extract domain from the email
        const emailParts = email.split('@');
        const domain = emailParts.length === 2 ? emailParts[1] : null;

        if (!domain) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if the mentee already has a match
        const existingMatch = await MenteeProfile.findOne({
            'email': email,
            'profileInfo.matches': { $exists: true, $ne: [] },
        });

        // If match exists, return the matched mentor profile
        if (existingMatch) {
            const mentorEmail = existingMatch.profileInfo.matches[0].mentorEmail;
            const matchedMentorProfile = await MentorProfile.findOne({ 'email': mentorEmail });
            if (matchedMentorProfile) {
                return res.json({ profile: matchedMentorProfile });
            }
        }

        // Fetch the mentee profile to check availability
        const menteeProfile = await MenteeProfile.findOne({ email: email });
        if (!menteeProfile || !menteeProfile.profileInfo.available) {
            return res.status(404).json({ error: 'Mentee not available for matching' });
        }

        // Get all available mentor profiles with the same domain
        const availableMentorProfiles = await MentorProfile.find({
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        if (availableMentorProfiles.length === 0) {
            return res.status(404).json({ error: 'No available mentors with the specified domain' });
        }

        // Choose random mentor profile
        const randomMentorProfile = availableMentorProfiles[Math.floor(Math.random() * availableMentorProfiles.length)];

        // Set both the mentee and mentor as not available
        menteeProfile.profileInfo.available = false;
        randomMentorProfile.profileInfo.available = false;

        // Update matches in both profiles
        menteeProfile.profileInfo.matches.push({ mentorEmail: randomMentorProfile.email });
        randomMentorProfile.profileInfo.matches.push({ menteeEmail: email });

        // Save the updated profiles
        await menteeProfile.save();
        await randomMentorProfile.save();

        res.json({ profile: randomMentorProfile });
    } catch (error) {
        console.error('Error fetching random mentor profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/getFilteredMentorProfile', async (req, res) => {
    try {
        const { email, language, developmentAreas, mentoringMethods } = req.query;

        // Extract domain from email
        const emailParts = email ? email.split('@') : [];
        const domain = emailParts.length === 2 ? emailParts[1] : null;

        if (email && !domain) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const filter = {
            userType: 'mentor',
            'profileInfo.available': true,
        };

        if (email) {
            filter['email'] = { $regex: new RegExp(`@${domain}$`, 'i') };
        }

        if (language && language.length > 0) {
            filter['profileInfo.languages'] = { $in: language.split(',') };
        }

        if (developmentAreas && developmentAreas.length > 0) {
            filter['profileInfo.developmentAreas'] = { $in: developmentAreas.split(',') };
        }

        if (mentoringMethods && mentoringMethods.length > 0) {
            filter['profileInfo.mentoringMethods'] = { $in: mentoringMethods.split(',') };
        }

        const menteeProfile = await MenteeProfile.findOne({ email });
        if (menteeProfile && menteeProfile.profileInfo.matches.length > 0) {
            // The mentee has matches, find corresponding mentors
            const mentorEmails = menteeProfile.profileInfo.matches.map(match => match.mentorEmail);
            const mentorsWithMatches = await MentorProfile.find({ email: { $in: mentorEmails } });
            return res.json({ profiles: mentorsWithMatches, isMatch: true });
        }

        const filteredMentorProfiles = await MentorProfile.find(filter);

        if (filteredMentorProfiles.length === 0) {
            return res.status(404).json({ error: 'No mentor profiles found' });
        }

        res.json({ profiles: filteredMentorProfiles, isMatch: false });
    } catch (error) {
        console.error('Error fetching filtered mentor profiles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getFilteredMenteeProfile', async (req, res) => {
    try {
        const { email, language, developmentAreas, mentoringMethods } = req.query;

        // Extract domain from the email
        const emailParts = email ? email.split('@') : [];
        const domain = emailParts.length === 2 ? emailParts[1] : null;

        if (email && !domain) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const filter = {
            userType: 'mentee',
            'profileInfo.available': true,
        };

        if (email) {
            filter['email'] = { $regex: new RegExp(`@${domain}$`, 'i') };
        }

        if (language && language.length > 0) {
            filter['profileInfo.languages'] = { $in: language.split(',') };
        }

        if (developmentAreas && developmentAreas.length > 0) {
            filter['profileInfo.developmentAreas'] = { $in: developmentAreas.split(',') };
        }

        if (mentoringMethods && mentoringMethods.length > 0) {
            filter['profileInfo.mentoringMethods'] = { $in: mentoringMethods.split(',') };
        }

        const mentorProfile = await MentorProfile.findOne({ email });
        if (mentorProfile && mentorProfile.profileInfo.matches.length > 0) {
            // The mentor has matches, find corresponding mentees
            const menteeEmails = mentorProfile.profileInfo.matches.map(match => match.menteeEmail);
            const menteesWithMatches = await MenteeProfile.find({ email: { $in: menteeEmails } });
            return res.json({ profiles: menteesWithMatches, isMatch: true });
        }

        const filteredMenteeProfiles = await MenteeProfile.find(filter);

        if (filteredMenteeProfiles.length === 0) {
            return res.status(404).json({ error: 'No mentee profiles found' });
        }

        res.json({ profiles: filteredMenteeProfiles, isMatch: false });
    } catch (error) {
        console.error('Error fetching filtered mentee profiles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.get('/getRandomMenteeProfile', async (req, res) => {
    try {
        const { email } = req.query;

        // Extract domain from email
        const emailParts = email.split('@');
        const domain = emailParts.length === 2 ? emailParts[1] : null;

        if (!domain) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if mentor already has a match
        const existingMatch = await MentorProfile.findOne({
            'email': email,
            'profileInfo.matches': { $exists: true, $ne: [] },
        });

        // If a match exists, return the matched mentee profile
        if (existingMatch) {
            const menteeEmail = existingMatch.profileInfo.matches[0].menteeEmail;
            const matchedMenteeProfile = await MenteeProfile.findOne({ 'email': menteeEmail });
            if (matchedMenteeProfile) {
                return res.json({ profile: matchedMenteeProfile });
            }
        }

        // Fetch the mentor profile to check availability
        const mentorProfile = await MentorProfile.findOne({ email: email });
        if (!mentorProfile || !mentorProfile.profileInfo.available) {
            return res.status(404).json({ error: 'Mentor not available for matching' });
        }

        // Get all available mentee profiles with the same domain
        const availableMenteeProfiles = await MenteeProfile.find({
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        if (availableMenteeProfiles.length === 0) {
            return res.status(404).json({ error: 'No available mentees with the specified domain' });
        }

        // Choose a random mentee profile
        const randomMenteeProfile = availableMenteeProfiles[Math.floor(Math.random() * availableMenteeProfiles.length)];

        // Set both the mentor and mentee as not available
        mentorProfile.profileInfo.available = false;
        randomMenteeProfile.profileInfo.available = false;

        // Update matches in both profiles
        mentorProfile.profileInfo.matches.push({ menteeEmail: randomMenteeProfile.email });
        randomMenteeProfile.profileInfo.matches.push({ mentorEmail: email });

        // Save the updated profiles
        await mentorProfile.save();
        await randomMenteeProfile.save();

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
    const { senderEmail, receiverEmail, userType } = req.body;

    try {
        let senderProfile, receiverProfile;

        if (userType === 'mentee') {
            senderProfile = await MenteeProfile.findOne({ email: senderEmail });
            receiverProfile = await MentorProfile.findOne({ email: receiverEmail });
        } else if (userType === 'mentor') {
            senderProfile = await MentorProfile.findOne({ email: senderEmail });
            receiverProfile = await MenteeProfile.findOne({ email: receiverEmail });
        } else {
            return res.status(400).json({ error: 'Invalid user type' });
        }

        if (!senderProfile || !receiverProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check if receiver has already sent a request to the sender
        if (receiverProfile.profileInfo.sentRequests.some(request => request.receiverEmail === senderEmail)) {
            return res.status(401).json({ error: 'You already have a received request from this user' });
        }

        if (
            senderProfile.profileInfo.sentRequests.some(request => request.receiverEmail === receiverEmail) ||
            receiverProfile.profileInfo.receivedRequests.some(request => request.senderEmail === senderEmail)
        ) {
            return res.status(401).json({ error: 'Match request already sent or received' });
        }

        // Update sender's sentRequests and receiver's receivedRequests
        senderProfile.profileInfo.sentRequests.push({ receiverEmail });
        receiverProfile.profileInfo.receivedRequests.push({ senderEmail });

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
        if (userType === 'mentee') {
            const userProfile = await MenteeProfile.findOne({ email });

            if (!userProfile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            const receivedRequests = userProfile.profileInfo.receivedRequests;
            res.json({ receivedRequests });

        } else if (userType === 'mentor') {
            const userProfile = await MentorProfile.findOne({ email });

            if (!userProfile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            const receivedRequests = userProfile.profileInfo.receivedRequests;
            res.json({ receivedRequests });
        }

    } catch (error) {
        console.error('Error fetching received requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.post('/getSentRequests', async (req, res) => {
    const { email, userType } = req.body;

    try {
        if (userType === 'mentee') {
            const userProfile = await MenteeProfile.findOne({ email });

            if (!userProfile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            // Extract sentRequests from the user's profile
            const sentRequests = userProfile.profileInfo.sentRequests || [];
            res.json({ sentRequests });
        }

        else if (userType === 'mentor') {
            const userProfile = await MentorProfile.findOne({ email });

            if (!userProfile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            // Extract sentRequests from the user's profile
            const sentRequests = userProfile.profileInfo.sentRequests || [];
            res.json({ sentRequests });
        }
    } catch (error) {
        console.error('Error fetching sent requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/getShortlistOrder', async (req, res) => {
    const { email, userType } = req.body;

    try {
        let profileModel;

        if (userType === 'mentee') {
            profileModel = MenteeProfile;
        } else if (userType === 'mentor') {
            profileModel = MentorProfile;
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // Find the user profile and return the shortlist order
        const userProfile = await profileModel.findOne({ email });
        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ shortlistOrder: userProfile.profileInfo.shortlistOrder || [] });
    } catch (error) {
        console.error('Error getting shortlist order:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/updateRequestOrder', async (req, res) => {
    try {
        const { orderInformation, userType, email } = req.body;

        let UserProfileModel;

        if (userType === 'mentee') {
            UserProfileModel = MenteeProfile;
        } else if (userType === 'mentor') {
            UserProfileModel = MentorProfile;
        } else {
            return res.status(400).json({ message: 'Invalid userType' });
        }

        // Find the user profile by email and userType
        const userProfile = await UserProfileModel.findOne({
            email,
            userType,
        });
        // Update the order information in the user's profile
        if (userProfile) {
            userProfile.profileInfo.shortlistOrder = orderInformation;
            await userProfile.save();

            res.status(200).json({ message: 'Order updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.delete('/cancelRequest/:receiverEmail', async (req, res) => {
    const { email, userType } = req.body;
    const { receiverEmail } = req.params;

    try {

        if (userType === 'mentee') {
            const profile = await MenteeProfile.findOne({ email });

            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            // Check if request is in shortlistOrder
            const isInShortlist = profile.profileInfo.shortlistOrder.some(item => item.requestId.equals(receiverEmail));

            const updateOperations = {
                $pull: { 'profileInfo.sentRequests': { receiverEmail: receiverEmail } },
            };

            if (isInShortlist) {
                updateOperations.$pull['profileInfo.shortlistOrder'] = { requestId: mongoose.Types.ObjectId(receiverEmail) };
            }

            const updatedProfile = await MenteeProfile.findOneAndUpdate(
                { email },
                updateOperations,
                { new: true }
            );

            if (!updatedProfile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            const receiverProfile = await MentorProfile.findOneAndUpdate(
                { 'profileInfo.receivedRequests.senderEmail': email },
                { $pull: { 'profileInfo.receivedRequests': { senderEmail: email } } },
                { new: true }
            );

            if (!receiverProfile) {
                return res.status(404).json({ error: 'Receiver profile not found' });
            }
        }

        if (userType === 'mentor') {
            const profile = await MentorProfile.findOne({ email });

            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            // Check if request is in shortlistOrder
            const isInShortlist = profile.profileInfo.shortlistOrder.some(item => item.requestId.equals(receiverEmail));

            const updateOperations = {
                $pull: { 'profileInfo.sentRequests': { receiverEmail: receiverEmail } },
            };

            if (isInShortlist) {
                updateOperations.$pull['profileInfo.shortlistOrder'] = { requestId: mongoose.Types.ObjectId(receiverEmail) };
            }

            const updatedProfile = await MentorProfile.findOneAndUpdate(
                { email },
                updateOperations,
                { new: true }
            );

            if (!updatedProfile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            const receiverProfile = await MenteeProfile.findOneAndUpdate(
                { 'profileInfo.receivedRequests.senderEmail': email },
                { $pull: { 'profileInfo.receivedRequests': { senderEmail: email } } },
                { new: true }
            );

            if (!receiverProfile) {
                return res.status(404).json({ error: 'Receiver profile not found' });
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error canceling request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/acceptRequest', async (req, res) => {
    const { email, senderEmail, userType } = req.body;

    try {
        if (userType === 'mentee') {
            await MenteeProfile.updateOne(
                { email },
                {
                    $set: {
                        'profileInfo.receivedRequests.$[elem].accepted': true,
                    },
                },
                {
                    arrayFilters: [
                        {
                            'elem.senderEmail': senderEmail,
                            'elem.accepted': false, // Only update if not already accepted
                        },
                    ],
                }
            );

            // Update the sent request
            await MentorProfile.updateOne(
                { 'profileInfo.sentRequests.receiverEmail': email },
                { $set: { 'profileInfo.sentRequests.$.accepted': true } }
            );
        }

        if (userType === 'mentor') {
            await MentorProfile.updateOne(
                { email },
                {
                    $set: {
                        'profileInfo.receivedRequests.$[elem].accepted': true,
                    },
                },
                {
                    arrayFilters: [
                        {
                            'elem.senderEmail': senderEmail,
                            'elem.accepted': false, // Only update if not already accepted
                        },
                    ],
                }
            );

            // Update the sent request
            await MenteeProfile.updateOne(
                { 'profileInfo.sentRequests.receiverEmail': email },
                { $set: { 'profileInfo.sentRequests.$.accepted': true } }
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error accepting request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/declineRequest', async (req, res) => {
    const { email, senderEmail, userType } = req.body;
    try {
        const update = { $set: { 'receivedRequests.$.declined': true }, 
        $inc: { 'declinedRequestsCount': 1 } };
        const Profile = userType === 'mentee' ? MenteeProfile : MentorProfile;

        const profile = await Profile.findOneAndUpdate(
            { email, 'receivedRequests.senderEmail': senderEmail },
            update,
            { new: true }
        );
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // Update shortlistOrder and save
        profile.shortlistOrder = profile.shortlistOrder.filter(item => item.requestId.toString() 
        !== profile.receivedRequests.find(req => req.senderEmail === senderEmail)._id.toString());
        await profile.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error declining request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/managerProfile', async (req, res) => {
    const { orgName, matchingMethod, blindMatching, email, userType, } = req.body;

    try {
        let profile = await ManagerProfile.findOne({ email });

        if (!profile) {
            // Create a new profile if it doesn't exist
            profile = new ManagerProfile({
                email: email,
                userType: userType,
                profileInfo: {
                    orgName,
                    matchingMethod,
                    blindMatching,
                },
            });
        } else {
            // Update existing profile
            profile.profileInfo = {
                orgName,
                matchingMethod,
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

router.put('/updateUserProfile', async (req, res) => {
    try {
        const { email, userType, data } = req.body;

        if (!email || !userType || !data) {
            return res.status(400).json({ error: 'Invalid request parameters' });
        }

        if (userType === 'mentee') {
            const profile = await MenteeProfile.findOne({ email, userType });

            if (!profile) {
                return res.status(404).json({ error: 'User profile not found' });
            }

            // Update profile fields
            Object.keys(data).forEach((field) => {
                profile.profileInfo[field] = data[field];
            });

            // Save the updated profile
            await profile.save();
        }

        if (userType === 'mentor') {
            const profile = await MentorProfile.findOne({ email, userType });

            if (!profile) {
                return res.status(404).json({ error: 'User profile not found' });
            }

            // Update profile fields
            Object.keys(data).forEach((field) => {
                profile.profileInfo[field] = data[field];
            });

            // Save the updated profile
            await profile.save();
        }

        return res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
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
        // Check if token is in the blacklist
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
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

const matchLogic = async (domainFilter = null) => {
    try {
        // Filter by Available accounts and by Domain
        let query = { 'profileInfo.available': true };
        if (domainFilter) {
            const regex = new RegExp(`@${domainFilter}$`, 'i');
            query = { 'email': { $regex: regex } };
        }

        // Fetch shortlists for mentees and mentors
        const menteesShortlist = await MenteeProfile.find(query, 'email profileInfo.shortlistOrder').sort({ 'profileInfo.signUpDate': 1 });
        const mentorsShortlist = await MentorProfile.find(query, 'email profileInfo.shortlistOrder').sort({ 'profileInfo.signUpDate': 1 });

        console.log('Mentees Shortlist:');
        menteesShortlist.forEach(mentee => {
            console.log(`Mentee Email: ${mentee.email}`);
            console.log('Shortlist Order:');
            mentee.profileInfo.shortlistOrder.forEach(item => {
                console.log(`  Request ID: ${item.requestId}`);
            });
            console.log('-------------------------');
        });

        console.log('Mentors Shortlist:');
        mentorsShortlist.forEach(mentor => {
            console.log(`Mentor Email: ${mentor.email}`);
            console.log('Shortlist Order:');
            mentor.profileInfo.shortlistOrder.forEach(item => {
                console.log(`  Request ID: ${item.requestId}`);
            });
            console.log('-------------------------');
        });

        let allRequestIds = []; // Array to store all request IDs
        let requestIdToMatchEmailMap = {}; // Mapping of request IDs to match emails

        // Fetch and process each mentee's shortlist
        for (const mentee of menteesShortlist) {
            for (const item of mentee.profileInfo.shortlistOrder) {
                allRequestIds.push(item.requestId);

                // Fetch received request
                const receivedRequest = await MenteeProfile.findOne({ 'profileInfo.receivedRequests._id': item.requestId }, 'profileInfo.receivedRequests.$');
                if (receivedRequest) {
                    requestIdToMatchEmailMap[item.requestId.toString()] = receivedRequest.profileInfo.receivedRequests[0].senderEmail;
                    continue;
                }

                // Fetch sent request
                const sentRequest = await MenteeProfile.findOne({ 'profileInfo.sentRequests._id': item.requestId }, 'profileInfo.sentRequests.$');
                if (sentRequest) {
                    if (!sentRequest.profileInfo.sentRequests[0].accepted) {
                        // If request is not accepted, remove it from the shortlistOrder
                        await MenteeProfile.findOneAndUpdate(
                            { 'email': mentee.email },
                            { $pull: { 'profileInfo.shortlistOrder': { 'requestId': item.requestId } } }
                        );
                    }
                    requestIdToMatchEmailMap[item.requestId.toString()] = sentRequest.profileInfo.sentRequests[0].receiverEmail;
                }
            }
        }

        // Fetch and process each mentor's shortlist
        for (const mentor of mentorsShortlist) {
            for (const item of mentor.profileInfo.shortlistOrder) {
                allRequestIds.push(item.requestId);

                // Fetch received request
                const receivedRequest = await MentorProfile.findOne({ 'profileInfo.receivedRequests._id': item.requestId }, 'profileInfo.receivedRequests.$');
                if (receivedRequest) {
                    requestIdToMatchEmailMap[item.requestId.toString()] = receivedRequest.profileInfo.receivedRequests[0].senderEmail;
                    continue;
                }

                // Fetch sent request
                const sentRequest = await MentorProfile.findOne({ 'profileInfo.sentRequests._id': item.requestId }, 'profileInfo.sentRequests.$');
                if (sentRequest) {
                    requestIdToMatchEmailMap[item.requestId.toString()] = sentRequest.profileInfo.sentRequests[0].receiverEmail;
                }
            }
        }

        // Remove duplicate request IDs
        allRequestIds = [...new Set(allRequestIds)];

        // Replace request IDs in preferences with match emails
        const updatePreferencesWithMatchEmails = (preferences) => {
            return preferences.map(requestId => requestIdToMatchEmailMap[requestId.toString()] || requestId);
        };

        // Update mentee preferences
        const menteePreferences = menteesShortlist.map(mentee => ({
            email: mentee.email,
            preferences: updatePreferencesWithMatchEmails(mentee.profileInfo.shortlistOrder.map(item => item.requestId.toString())),
            declinedRequestsCount: mentee.profileInfo.declinedRequestsCount,
        }));

        // Update mentor preferences
        const mentorPreferences = mentorsShortlist.map(mentor => ({
            email: mentor.email,
            preferences: updatePreferencesWithMatchEmails(mentor.profileInfo.shortlistOrder.map(item => item.requestId.toString())),
            declinedRequestsCount: mentor.profileInfo.declinedRequestsCount,
        }));

        // Gale-Shapley algorithm
        const matches = galeShapley(menteePreferences, mentorPreferences, menteesShortlist, mentorsShortlist);
        console.log(matches);

        // Iterate through matches and update profiles
        for (const [mentorId, menteeEmail] of Object.entries(matches)) {
            // Fetch the mentor's email using their ID
            const mentorProfile = await MentorProfile.findOne({ email: mentorId });
            const mentorEmail = mentorProfile ? mentorProfile.email : null;

            if (mentorEmail && menteeEmail) {
                await MentorProfile.findOneAndUpdate(
                    { email: mentorEmail },
                    { $set: { 'profileInfo.matches': [{ menteeEmail }], 'profileInfo.available': false } }
                );

                await MenteeProfile.findOneAndUpdate(
                    { email: menteeEmail },
                    { $set: { 'profileInfo.matches': [{ mentorEmail }], 'profileInfo.available': false } }
                );
            }
        }

        console.log('Matching process completed successfully.');
    } catch (error) {
        console.error('Error during matching process:', error);
    }
};


// Scheduled matching on the 1st, 14th and 28th of every month at 00:00
cron.schedule('0 0 14,28 * *', async () => {
    try {
        console.log('Running scheduled matching process for all accounts...');
        await matchLogic();
    } catch (error) {
        console.error('Error during scheduled matching process:', error);
    }
});



// Minute then hour
// cron.schedule('32 20 * * *', async () => {
//     try {
//         console.log('Running matching process for @test.com accounts...');
//         await matchLogic("test.com"); // Pass "test.com" as the domain
//     } catch (error) {
//         console.error('Error during scheduled matching process:', error);
//     }
// });

const calculateNextMatchDay = () => {
    const today = new Date();
    const currentDay = today.getDate();
    let nextMatchDate;

    // If today's date is before or on the 14th, the next match is on the 14th
    // If it's after the 14th but before or on the 28th, the next match is on the 28th
    // If it's after the 28th, the next match is on the 14th of the next month
    if (currentDay <= 14) {
        nextMatchDate = new Date(today.getFullYear(), today.getMonth(), 14);
    } else if (currentDay <= 28) {
        nextMatchDate = new Date(today.getFullYear(), today.getMonth(), 28);
    } else {
        nextMatchDate = new Date(today.getFullYear(), today.getMonth() + 1, 14);
    }

    // Calculate the difference in days
    const diffTime = Math.abs(nextMatchDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

router.get('/getNextMatchDay', (req, res) => {
    const daysUntilNextMatch = calculateNextMatchDay();
    res.json({ daysUntilNextMatch });
});


router.get('/matched-stats/:adminEmail', async (req, res) => {
    try {
        const adminEmail = req.params.adminEmail;

        // Extract domain from admin email
        const domain = adminEmail.split('@')[1];

        // Get all mentor profiles with the same domain and available
        const mentorProfiles = await MentorProfile.find({
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
        });

        // Get all mentee profiles with the same domain and available
        const menteeProfiles = await MenteeProfile.find({
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
        });

        // Calculate total number of users
        const totalUsers = mentorProfiles.length + menteeProfiles.length;

        // Get the number of mentors and mentees
        const mentorCount = mentorProfiles.length;
        const menteeCount = menteeProfiles.length;

        // Get the number of mentors with at least one match
        const mentorMatchesCount = mentorProfiles.filter(profile => profile.profileInfo.matches.length > 0).length;

        // Get the number of mentees with at least one match
        const menteeMatchesCount = menteeProfiles.filter(profile => profile.profileInfo.matches.length > 0).length;

        res.json({
            totalUsers,
            mentorCount,
            menteeCount,
            mentorMatchesCount,
            menteeMatchesCount,
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/average-signup-duration/:adminEmail', async (req, res) => {
    try {
        const adminEmail = req.params.adminEmail;

        // Extract domain from admin email
        const domain = adminEmail.split('@')[1];

        // Get all mentor profiles with the same domain and available
        const mentorProfiles = await MentorProfile.find({
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        // Get all mentee profiles with the same domain and available
        const menteeProfiles = await MenteeProfile.find({
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        // Combine mentor and mentee profiles
        const allProfiles = [...mentorProfiles, ...menteeProfiles];

        // Calculate the total number of users
        const totalUsers = allProfiles.length;

        // Calculate the total sign-up duration in milliseconds
        const totalSignupDuration = allProfiles.reduce((acc, profile) => {
            const signupDate = new Date(profile.profileInfo.signUpDate);
            const currentDate = new Date();
            const duration = currentDate - signupDate;
            return acc + duration;
        }, 0);

        // Calculate average sign-up duration in days
        const averageSignupDuration = totalSignupDuration / (totalUsers * 24 * 60 * 60 * 1000);

        res.json({
            totalUsers,
            averageSignupDurationDays: averageSignupDuration,
        });
    } catch (error) {
        console.error('Error fetching average sign-up duration:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/department-stats/:adminEmail', async (req, res) => {
    try {
        const adminEmail = req.params.adminEmail;

        // Extract domain from admin email
        const domain = adminEmail.split('@')[1];

        // Get all mentor departments with the same domain and available
        const mentorDepartments = await MentorProfile.distinct('profileInfo.department', {
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        // Get all mentee departments with the same domain and available
        const menteeDepartments = await MenteeProfile.distinct('profileInfo.department', {
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        // Combine and remove duplicates
        const allDepartments = [...new Set([...mentorDepartments, ...menteeDepartments])];

        // Get user count for each department
        const departmentStats = allDepartments.map(async (department) => {
            const mentorCount = await MentorProfile.countDocuments({
                'profileInfo.department': department,
                'profileInfo.available': true,
            });

            const menteeCount = await MenteeProfile.countDocuments({
                'profileInfo.department': department,
                'profileInfo.available': true,
            });

            return {
                department,
                userCount: mentorCount + menteeCount,
            };
        });

        const resolvedDepartmentStats = await Promise.all(departmentStats);

        res.json({
            departmentStats: resolvedDepartmentStats,
        });
    } catch (error) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/development-area-stats/:adminEmail', async (req, res) => {
    try {
        const adminEmail = req.params.adminEmail;

        // Extract domain from admin email
        const domain = adminEmail.split('@')[1];

        // Get all mentor development areas with the same domain and available
        const mentorDevelopmentAreas = await MentorProfile.distinct('profileInfo.developmentAreas', {
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        // Get all mentee development areas with the same domain and available
        const menteeDevelopmentAreas = await MenteeProfile.distinct('profileInfo.developmentAreas', {
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        // Combine and remove duplicates
        const allDevelopmentAreas = [...new Set([...mentorDevelopmentAreas, ...menteeDevelopmentAreas])];

        // Get user count for each development area
        const developmentAreaStats = allDevelopmentAreas.map(async (developmentArea) => {
            const mentorCount = await MentorProfile.countDocuments({
                'profileInfo.developmentAreas': developmentArea,
                'profileInfo.available': true,
            });

            const menteeCount = await MenteeProfile.countDocuments({
                'profileInfo.developmentAreas': developmentArea,
                'profileInfo.available': true,
            });

            return {
                developmentArea,
                userCount: mentorCount + menteeCount,
            };
        });

        const resolvedDevelopmentAreaStats = await Promise.all(developmentAreaStats);

        res.json({
            developmentAreaStats: resolvedDevelopmentAreaStats,
        });
    } catch (error) {
        console.error('Error fetching development area stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/location-stats/:adminEmail', async (req, res) => {
    try {
        const adminEmail = req.params.adminEmail;

        // Extract domain from admin email
        const domain = adminEmail.split('@')[1];

        // Get all mentor location with the same domain and available
        const mentorLocations = await MentorProfile.distinct('profileInfo.officeLocation', {
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        // Get all mentee location with the same domain and available
        const menteeLocations = await MenteeProfile.distinct('profileInfo.officeLocation', {
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        // Combine and remove duplicates
        const allLocations = [...new Set([...mentorLocations, ...menteeLocations])];

        // Get user count for each location
        const locationStats = allLocations.map(async (location) => {
            const mentorCount = await MentorProfile.countDocuments({
                'profileInfo.officeLocation': location,
                'profileInfo.available': true,
            });

            const menteeCount = await MenteeProfile.countDocuments({
                'profileInfo.officeLocation': location,
                'profileInfo.available': true,
            });

            return {
                location,
                userCount: mentorCount + menteeCount,
            };
        });

        const resolvedLocationStats = await Promise.all(locationStats);

        res.json({
            locationStats: resolvedLocationStats,
        });
    } catch (error) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/match-data-by-date/:adminEmail', async (req, res) => {
    try {
        const adminEmail = req.params.adminEmail;

        // Extract domain from admin email
        const domain = adminEmail.split('@')[1];

        // Fetch mentee profiles with the same domain
        const menteeProfiles = await MenteeProfile.find({
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
        });

        // Fetch mentor profiles with the same domain
        const mentorProfiles = await MentorProfile.find({
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
        });

        // Extract match data from both mentee and mentor profiles
        const menteeMatchData = menteeProfiles.flatMap(profile => profile.profileInfo.matches);
        const mentorMatchData = mentorProfiles.flatMap(profile => profile.profileInfo.matches);

        // Combine match data from both mentees and mentors
        const allMatchData = [...menteeMatchData, ...mentorMatchData];

        // Extract dates from match data
        const matchDates = allMatchData.map(match => moment(match.date).format('YYYY-MM-DD'));

        // Count matches by date
        const matchCountByDate = matchDates.reduce((acc, date) => {
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        res.json(matchCountByDate);
    } catch (error) {
        console.error('Error fetching match data by date:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
