
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
                round: {
                    type: Number,
                    required: true,
                },
            },
        ],
        matchedInCurrentRound: {
            type: Boolean,
            default: false,
        },
        shortlistOrder: [
            {
                requestId: {
                    type: mongoose.Schema.Types.ObjectId,  // Assuming _id is of type ObjectId
                    ref: 'MentorProfiles',  // Reference to the MenteeProfiles collection
                    required: true,
                }
            }
        ],
        available: { type: Boolean, default: true },
        admin:String,
    },
});

const MentorProfile = mongoose.model('MentorProfiles', mentorProfileSchema, 'MentorProfiles');


module.exports = MentorProfile;
