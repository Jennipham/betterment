
const { Binary } = require('mongodb');
const mongoose = require('mongoose');

const menteeProfileSchema = new mongoose.Schema({
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
                accepted: { type: Boolean, default: false },
      
            }
        ],
        receivedRequests: [
            {
                senderEmail: { type: String, required: true },
                expiration: { type: Date, required: true },
                accepted: { type: Boolean, default: false },
                declined: { type: Boolean, default: false },
            }
        ],
        available: { type: Boolean, default: true },
    },
});

const MenteeProfile = mongoose.model('MenteeProfiles', menteeProfileSchema, 'MenteeProfiles');


module.exports = MenteeProfile;
