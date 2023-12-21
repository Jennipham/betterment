
const mongoose = require('mongoose');

const managerProfileSchema = new mongoose.Schema({
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
        domain: String,
        department: String,
        officeLocation: String,
        mentoringMethods: [String],
        blindMatching: String,
    },
});

const ManagerProfile = mongoose.model('ManagerProfiles', managerProfileSchema, 'ManagerProfiles');


module.exports = ManagerProfile;
