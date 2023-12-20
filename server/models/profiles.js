
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
        languages:[String],
        developmentAreas:[String],
        mentoringMethods:[String],
    },
});

const Profile = mongoose.model('Profiles', profileSchema, 'Profiles');


module.exports = Profile;
