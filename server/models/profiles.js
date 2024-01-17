
const { Binary } = require('mongodb');
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    userType: {
        type: String,
        required: true,
    },
    profileInfo: {
        // Add fields specific to the user's profile
        jobRole: String,
        department: String,
        officeLocation: String,
        capacity: String,
        languages:[String],
        developmentAreas:[String],
        mentoringMethods: [String],
        sentRequests: [
            {
                receiverEmail: { type: String, required: true },
                expiration: { type: Date, required: true },
            }
        ],
        receivedRequests: [
            {
                senderEmail: { type: String, required: true },
                expiration: { type: Date, required: true },
            }
        ],
        acceptedRequests: [String],
        matchedUp: [String]
    },
});

const Profile = mongoose.model('Profiles', profileSchema, 'Profiles');


module.exports = Profile;
