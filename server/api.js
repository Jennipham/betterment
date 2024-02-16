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
const { validationResult } = require('express-validator'); // For input validation
const galeShapley = require('./controllers/matching');

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

            // If domain is available, try to find corresponding admin
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
                            developmentAreas: [],
                            mentoringMethods: [],
                            sentRequests: [],
                            receivedRequests: [],
                            shortlistOrder: [],
                            available: 'true',
                            matchedInCurrentRound: false,
                            declinedRequestsCount: 0,
                            matches:[],
                            admin:'',

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
                            developmentAreas: [],
                            mentoringMethods: [],
                            sentRequests: [],
                            receivedRequests: [],
                            shortlistOrder: [],
                            available: 'true',
                            matchedInCurrentRound: false,
                            declinedRequestsCount: 0,
                            matches:[],
                            admin:'',

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

    function calculateSimilarityScore(attribute1, attribute2) {
        return attribute1 === attribute2 ? 1 : 0;
    }
    
    // Function to calculate similarity score for two arrays
    const calculateArraySimilarityScore = (array1, array2) => {
        if (!Array.isArray(array1) || !Array.isArray(array2)) {
            // Handle the case where either array1 or array2 is not an array
            return 0; // or handle it based on your logic
        }
    
        const commonElements = array1.filter(element => array2.includes(element));
        return commonElements.length;
    };
    

    // router.get('/getPotentialMatches', async (req, res) => {
    //     try {
    //         const { userType, languages, department, officeLocation, developmentAreas, mentoringMethods } = req.query;
    //         let profiles;
    
    //         if (userType === 'mentee') {
    //             // Retrieve all mentor profiles with available set to true
    //             profiles = await MentorProfile.find({ 'profileInfo.available': true });
    //         } else if (userType === 'mentor') {
    //             // Retrieve all mentee profiles with available set to true
    //             profiles = await MenteeProfile.find({ 'profileInfo.available': true });
    //         } else {
    //             return res.status(400).json({ message: 'Invalid user type' });
    //         }
    
    //         // Calculate similarity score and order profiles
    //         const profilesWithScores = profiles.map(profile => {
    //             const profileAttributes = profile.profileInfo;
    
    //             let totalScore =
    //                 calculateSimilarityScore(department, profileAttributes.department) +
    //                 calculateSimilarityScore(officeLocation, profileAttributes.officeLocation) +
    //                 calculateArraySimilarityScore(developmentAreas, profileAttributes.developmentAreas) +
    //                 calculateArraySimilarityScore(mentoringMethods, profileAttributes.mentoringMethods);
    
    //             if (userType === 'mentee') {
    //                 totalScore += profileAttributes.level ? parseInt(profileAttributes.profileInfo.level) : 0;
    //             }
    
    //             return { ...profile, score: totalScore };
    //         });
    
    //         const sortedProfiles = profilesWithScores.sort((a, b) => b.score - a.score);

    //         console.log("sorted",sortedProfiles);
    
    //         // Filter profiles based on common languages
    //         const filteredProfiles = sortedProfiles.filter(profile => {
    //             const commonLanguages = profile.profileInfo.languages.filter(language =>
    //                 languages.includes(language)
    //             );
    //             return commonLanguages.length > 0; // Filter profiles with at least one common language
    //         });
    
    //         return res.json({ profiles: filteredProfiles });
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).json({ message: 'Internal Server Error' });
    //     }
    // });

    router.get('/getPotentialMatches', async (req, res) => {
        try {
            const { userType, languages, department, officeLocation, developmentAreas, mentoringMethods } = req.query;
            let profiles;
    
            if (userType === 'mentee') {
                // Retrieve all mentor profiles with available set to true
                profiles = await MentorProfile.find({ 'profileInfo.available': true });
            } else if (userType === 'mentor') {
                // Retrieve all mentee profiles with available set to true
                profiles = await MenteeProfile.find({ 'profileInfo.available': true });
            } else {
                return res.status(400).json({ message: 'Invalid user type' });
            }
    
            // Calculate similarity score and order profiles
            const profilesWithScores = profiles.map(profile => {
                const { _doc: { profileInfo } } = profile;
    
                let totalScore =
                    calculateSimilarityScore(department, profileInfo.department) +
                    calculateSimilarityScore(officeLocation, profileInfo.officeLocation) +
                    calculateArraySimilarityScore(developmentAreas, profileInfo.developmentAreas) +
                    calculateArraySimilarityScore(mentoringMethods, profileInfo.mentoringMethods);
    
                if (userType === 'mentee') {
                    totalScore += profileInfo.level ? parseInt(profileInfo.level) : 0;
                }
    
                return { ...profile, score: totalScore };
            });
    
            const sortedProfiles = profilesWithScores.sort((a, b) => b.score - a.score);
    
            console.log("sorted", sortedProfiles);
    
            // Filter profiles based on common languages
            const filteredProfiles = sortedProfiles.filter(profile => {
                const profileLanguages = profile._doc.profileInfo.languages;
            
                // Check if both profileLanguages and languages are defined before using the includes method
                const commonLanguages = profileLanguages && languages && profileLanguages.filter(language =>
                    languages.includes(language)
                );
            
                return commonLanguages && commonLanguages.length > 0;
            });
            
            return res.json({ profiles: filteredProfiles });
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
    const { signUpDate, jobRole, department, officeLocation, capacity, languages, level, developmentAreas, mentoringMethods, email, userType, sentRequests, receivedRequests, available, shortlistOrder, matchedInCurrentRound,
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

router.get('/getAdminMatchingSettings', async (req, res) => {
    try {
        const { email } = req.query;

        // Check if the email is provided
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find the admin profile by email
        const adminProfile = await ManagerProfile.findOne({ email });

        // Check if the admin profile exists
        if (!adminProfile) {
            return res.status(404).json({ error: 'Admin profile not found' });
        }

        // Extract blindMatching and matchingMethod from the admin profile
        const { blindMatching, matchingMethod } = adminProfile.profileInfo;

        // Send the extracted values as the response
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

        // Check if the user already has a match in their profile
        const existingMatch = await MentorProfile.findOne({
            'email': email,
            'profileInfo.matches': { $exists: true, $ne: [] },
        });

        if (existingMatch) {
            // Return the existing matched profile
            return res.json({ profile: existingMatch });
        }

        // Get all mentor profiles with the same domain and available
        const mentorProfiles = await MentorProfile.find({
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        if (mentorProfiles.length === 0) {
            return res.status(404).json({ error: 'No available mentor profiles with the specified domain' });
        }

        // Filter out profiles that are already a match for the mentee
        const availableMentorProfiles = mentorProfiles.filter(profile =>
            !profile.profileInfo.matches.some(match => match.menteeEmail === email)
        );

        if (availableMentorProfiles.length === 0) {
            return res.status(404).json({ error: 'No available mentor profiles without a match' });
        }

        // Choose a random mentor profile
        const randomMentorProfile = availableMentorProfiles[Math.floor(Math.random() * availableMentorProfiles.length)];

        // Update the mentee's profile with the match information
        const menteeEmail = email;
        const menteeProfile = await MenteeProfile.findOne({ email: menteeEmail });

        if (!menteeProfile) {
            return res.status(404).json({ error: 'Mentee profile not found' });
        }

        // Check the user capacity and set available accordingly
        menteeProfile.profileInfo.available = false;

        // Add the mentor email to the matches profile
        menteeProfile.profileInfo.matches.push({
            mentorEmail: randomMentorProfile.email,
        });

        // Save the updated mentee profile
        await menteeProfile.save();

        // Update the mentor profile with the match information
        randomMentorProfile.profileInfo.matches.push({
            menteeEmail: menteeEmail,
        });

        // Save the updated mentor profile
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

        // Extract domain from the email
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

        const filteredMentorProfiles = await MentorProfile.find(filter);

        if (filteredMentorProfiles.length === 0) {
            return res.status(404).json({ error: 'No mentor profiles found' });
        }

        res.json({ profiles: filteredMentorProfiles });
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

        const filteredMenteeProfiles = await MenteeProfile.find(filter);

        if (filteredMenteeProfiles.length === 0) {
            return res.status(404).json({ error: 'No mentee profiles found' });
        }

        res.json({ profiles: filteredMenteeProfiles });
    } catch (error) {
        console.error('Error fetching filtered mentee profiles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.get('/getRandomMenteeProfile', async (req, res) => {
    try {
        const { email } = req.query;

        // Extract domain from the email
        const emailParts = email.split('@');
        const domain = emailParts.length === 2 ? emailParts[1] : null;

        if (!domain) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if the user already has a match in their profile
        const existingMatch = await MenteeProfile.findOne({
            'email': email,
            'profileInfo.matches': { $exists: true, $ne: [] },
        });

        if (existingMatch) {
            // Return the existing matched profile
            return res.json({ profile: existingMatch });
        }

        // Get all mentee profiles with the same domain and available
        const menteeProfiles = await MenteeProfile.find({
            'email': { $regex: new RegExp(`@${domain}$`, 'i') },
            'profileInfo.available': true,
        });

        if (menteeProfiles.length === 0) {
            return res.status(404).json({ error: 'No available mentee profiles with the specified domain' });
        }

        // Filter out profiles that are already a match for the mentor
        const availableMenteeProfiles = menteeProfiles.filter(profile =>
            !profile.profileInfo.matches.some(match => match.mentorEmail === email)
        );

        if (availableMenteeProfiles.length === 0) {
            return res.status(404).json({ error: 'No available mentee profiles without a match' });
        }

        // Choose a random mentee profile
        const randomMenteeProfile = availableMenteeProfiles[Math.floor(Math.random() * availableMenteeProfiles.length)];

        // Update the mentor's profile with the match information
        const mentorEmail = email;
        const mentorProfile = await MentorProfile.findOne({ email: mentorEmail });

        if (!mentorProfile) {
            return res.status(404).json({ error: 'Mentor profile not found' });
        }

        // Check the user capacity and set available accordingly
        mentorProfile.profileInfo.available = false;

        // Add the mentee email to the matches profile
        mentorProfile.profileInfo.matches.push({
            menteeEmail: randomMenteeProfile.email,
        });

        // Save the updated mentor profile
        await mentorProfile.save();

        // Update the mentee profile with the match information
        randomMenteeProfile.profileInfo.matches.push({
            mentorEmail: mentorEmail,
        });

        // Save the updated mentee profile
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

        if (
            senderProfile.profileInfo.sentRequests.some(request => request.receiverEmail === receiverEmail) ||
            receiverProfile.profileInfo.receivedRequests.some(request => request.senderEmail === senderEmail)
        ) {
            return res.status(401).json({ error: 'Match request already sent or received' });
        }

        // Update sender's sentRequests and receiver's receivedRequests
        senderProfile.profileInfo.sentRequests.push({ receiverEmail });
        receiverProfile.profileInfo.receivedRequests.push({ senderEmail });

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

        // Choose the appropriate model based on user type
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

        // Choose the appropriate model based on userType
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
            userType, // Updated query
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

            // Check if the request is in shortlistOrder
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

            // Check if the request is in shortlistOrder
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
        let updateQuery;

        if (userType === 'mentee') {
            updateQuery = {
                $set: { 'profileInfo.receivedRequests.$.declined': true },
                $inc: { 'profileInfo.declinedRequestsCount': 1 },
            };
        } else if (userType === 'mentor') {
            updateQuery = {
                $set: { 'profileInfo.receivedRequests.$.declined': true },
                $inc: { 'profileInfo.declinedRequestsCount': 1 },
            };
        } else {
            return res.status(400).json({ error: 'Invalid userType' });
        }

        const profile = userType === 'mentee'
            ? await MenteeProfile.findOneAndUpdate(
                { email, 'profileInfo.receivedRequests.senderEmail': senderEmail },
                updateQuery,
                { new: true }
            )
            : await MentorProfile.findOneAndUpdate(
                { email, 'profileInfo.receivedRequests.senderEmail': senderEmail },
                updateQuery,
                { new: true }
            );

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Pull the request from the shortlist order array
        profile.profileInfo.shortlistOrder = profile.profileInfo.shortlistOrder.filter(orderItem => orderItem.requestId.toString() !== profile.profileInfo.receivedRequests.find(request => request.senderEmail === senderEmail)._id.toString());

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

            // Update profile fields based on the received data
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

            // Update profile fields based on the received data
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

const matchLogic = async () => {
    try {
        const menteesShortlist = await MenteeProfile.find({}, 'email profileInfo.shortlistOrder');
        const mentorsShortlist = await MentorProfile.find({}, 'email profileInfo.shortlistOrder');

        const menteePreferences = menteesShortlist.map(mentee => ({
            email: mentee.email,
            preferences: mentee.profileInfo.shortlistOrder.map(item => item.requestId.toString()),
            declinedRequestsCount: mentee.profileInfo.declinedRequestsCount,
        }));

        const mentorPreferences = mentorsShortlist.map(mentor => ({
            email: mentor.email,
            preferences: mentor.profileInfo.shortlistOrder.map(item => item.requestId.toString()),
            declinedRequestsCount: mentor.profileInfo.declinedRequestsCount,
        }));

        const matches = galeShapley(menteePreferences, mentorPreferences, menteesShortlist, mentorsShortlist);

        // Update the database with the matching results
        // (This part will depend on your specific database schema)

        console.log('Matching process completed successfully.');
    } catch (error) {
        console.error('Error during matching process:', error);
    }
};

// Schedule the task to run every 14 days
cron.schedule('0 0 */14 * *', async () => {
    try {
        console.log('Running matching process...');
        await matchLogic(); // Call the function containing the matching logic
    } catch (error) {
        console.error('Error during scheduled matching process:', error);
    }
});

router.get('/matched-stats/:adminEmail', async (req, res) => {
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

        // Calculate total number of users
        const totalUsers = mentorProfiles.length + menteeProfiles.length;

        // Get the number of mentors and mentees
        const mentorCount = mentorProfiles.length;
        const menteeCount = menteeProfiles.length;

        // Get the number of mentors with at least one match
        const mentorMatchesCount = mentorProfiles.filter(profile => profile.profileInfo.matches.length > 0).length;

        // Get the number of mentees with at least one match
        const menteeMatchesCount = menteeProfiles.filter(profile => profile.profileInfo.matches.length > 0).length;

        // Return the information in an appropriate format
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

        // Calculate the average sign-up duration in days
        const averageSignupDuration = totalSignupDuration / (totalUsers * 24 * 60 * 60 * 1000);

        // Return the information in an appropriate format
        res.json({
            totalUsers,
            averageSignupDurationDays: averageSignupDuration,
        });
    } catch (error) {
        console.error('Error fetching average sign-up duration:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Example endpoint for department stats
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

        // Wait for all promises to resolve
        const resolvedDepartmentStats = await Promise.all(departmentStats);

        // Return the information in an appropriate format
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

        // Wait for all promises to resolve
        const resolvedDevelopmentAreaStats = await Promise.all(developmentAreaStats);

        // Return the information in an appropriate format
        res.json({
            developmentAreaStats: resolvedDevelopmentAreaStats,
        });
    } catch (error) {
        console.error('Error fetching development area stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
