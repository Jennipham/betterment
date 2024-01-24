
const { Binary } = require('mongodb');
const mongoose = require('mongoose');

const mentorProfileSchema = new mongoose.Schema({
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
        signUpDate: { type: Date, default: Date.now },
        jobRole: String,
        department: String,
        officeLocation: String,
        capacity: String,
        level: String,
        languages: [String],
        developmentAreas: [String],
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

const MentorProfile = mongoose.model('MentorProfiles', mentorProfileSchema, 'MentorProfiles');


module.exports = MentorProfile;
