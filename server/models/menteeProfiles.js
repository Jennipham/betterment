
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
        signUpDate: { type: Date, default: Date.now },
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
                accepted: { type: Boolean, default: false },
      
            }
        ],
        receivedRequests: [
            {
                senderEmail: { type: String, required: true },
                accepted: { type: Boolean, default: false },
                declined: { type: Boolean, default: false },
            }
        ],
        declinedRequestsCount: { type: Number, default: 0 },
        matches: [
            {
                mentorEmail: {
                    type: String,
                    required: true,
                },
                date: { type: Date, default: Date.now },
            },
        ],
        matchedInCurrentRound: {
            type: Boolean,
            default: false,
        },
        shortlistOrder: [
            {
                requestId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'MenteeProfiles',  // Reference to the MenteeProfiles collection
                    required: true,
                }
            }
        ],
        available: { type: Boolean, default: true },
        admin:String,
    },
});

const MenteeProfile = mongoose.model('MenteeProfiles', menteeProfileSchema, 'MenteeProfiles');


module.exports = MenteeProfile;
