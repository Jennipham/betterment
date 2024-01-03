import React from 'react';
import '../styles/FullProfile.css';
import Footer from '../utils/footer';
import { useState, useEffect } from 'react';
import white from '../images/profile-white.png';
import axios from 'axios';


const FullProfile = () => {

    const [user, setUser] = useState({
        firstName: sessionStorage.getItem('firstName') || 'User',
        lastName: sessionStorage.getItem('lastName') || '',
        userType: sessionStorage.getItem('userType') || '',
        email: sessionStorage.getItem('email') || '',
        jobRole: sessionStorage.getItem('jobRole') || '',
    });

    const [mentorProfile, setMentorProfile] = useState(null);
    const [mentorFname, setMentorFname] = useState('');
    const [mentorSname, setMentorSname] = useState('');

    const mapValuesToLabels = (values, options) => {
        return values.map(value => {
            const option = options.find(option => option.value === value);
            return option ? option.label : value;
        });
    };
    const languageOptions = [
        { value: 'Afrikaans', label: 'Afrikaans' },
        { value: 'English', label: 'English' },
        { value: 'French', label: 'French' },
        { value: 'German', label: 'German' },
        { value: 'Hindi', label: 'Hindi' },
        { value: 'Hungarian', label: 'Hungarian' },
        { value: 'Marathi', label: 'Marathi' },
        { value: 'Italian', label: 'Italian' },
        { value: 'Portuguese', label: 'Portuguese' },
        { value: 'Romanian', label: 'Romanian' },
        { value: 'Spanish', label: 'Spanish' },
        { value: 'Swedish', label: 'Swedish' },
        { value: 'Turkish', label: 'Turkish' },
    ];

    const locationOptions = [
        { value: 'location', label: 'Location' },

    ];

    const developmentAreaOptions = [
        { value: 'Career', label: 'Career Decision' },
        { value: 'Communication', label: 'Communication' },
        { value: 'Confidence', label: 'Confidence' },
        { value: 'Conflict', label: 'Conflict' },
        { value: 'Goals', label: 'Goal Setting' },
        { value: 'Obstacles', label: 'Obstacles' },
        { value: 'Resilience', label: 'Resilience' },
        { value: 'Stakeholders', label: 'Stakeholder Conversations' },
        { value: 'Time', label: 'Time Management' },
        { value: 'Wellbeing', label: 'Wellbeing' },
        { value: 'Balance', label: 'Work / Life Balance' },
    ]

    const methodOptions = [
        { value: 'InPerson', label: 'In Person Sessions' },
        { value: 'Virtual', label: 'Virtual Sessions' },
    ]

    const capitaliseFirstLetter = (str) => {
        if (str === undefined) {
            return;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            // Fetch user data from session storage
            const firstName = sessionStorage.getItem('firstName');
            const lastName = sessionStorage.getItem('lastName');
            const userType = sessionStorage.getItem('userType');
            const email = sessionStorage.getItem('email');
            const jobRole = sessionStorage.getItem('jobRole') || '';
            const mentorProfile = sessionStorage.getItem('matchProfile');


            setUser({ firstName, lastName, userType, email, jobRole });
            setMentorProfile(mentorProfile ? JSON.parse(mentorProfile) : null);
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchMentorData = async () => {
            try {
                if (mentorProfile && mentorProfile.email) {
                    const response = await axios.get(`http://localhost:3001/getUserDetails?email=${mentorProfile.email}`);
                    setMentorFname(response.data.user.fname);
                    setMentorSname(response.data.user.sname);
                }
            } catch (error) {
                console.error('Error fetching mentor data:', error);
            }
        };
        fetchMentorData();
    }, [mentorProfile]);

    return (
        <>
            <div className="full-profile-container">
                <div className="profile-right">
                    <div className="profile-icon">
                        <img src={white} alt="White Profile Icon" />
                    </div>
                    <div className="match-info">
                        <p>Name: {mentorFname && mentorSname ? `${mentorFname} ${mentorSname}` : ''}</p>
                        <p>Job Role: {mentorProfile && mentorProfile.profileInfo.jobRole ? capitaliseFirstLetter(mentorProfile.profileInfo.jobRole) : ''}</p>
                    </div>
                    <div className="matching-info-right">
                        <p>Location: {mentorProfile && mentorProfile.profileInfo.officeLocation ? capitaliseFirstLetter(mentorProfile.profileInfo.officeLocation) : ''}</p>
                        <p>Development Areas: {mentorProfile && mentorProfile.profileInfo.developmentAreas ? mentorProfile.profileInfo.developmentAreas.join(', ') : ''}</p>
                        <p>Methods of Matching: {mentorProfile && mentorProfile.profileInfo.mentoringMethods ? mapValuesToLabels(mentorProfile.profileInfo.mentoringMethods, methodOptions).join(', ') : ''}</p>
                    </div>
                    <div className="bottom-buttons-container">
        
                        <button className='match-request-button'>Request Match</button>
                    </div>
                </div>

            </div>

            <Footer />
        </>
    );
};

export default FullProfile;
