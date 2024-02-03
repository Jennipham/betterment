import React from 'react';
import '../styles/FullProfile.css';
import Footer from '../utils/footer';
import { useState, useEffect } from 'react';
import white from '../images/profile-white.png';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const FullProfile = () => {

    const { email } = useParams();

    const [matchFname, setMatchFname] = useState('');
    const [matchSname, setMatchSname] = useState('');
    const [matchUserType, setMatchUserType] = useState('');
    const [matchProfile, setMatchProfile] = useState(null);

    const [errorMessage, setErrorMessage] = useState('');

    const mapValuesToLabels = (values, options) => {
        return values.map(value => {
            const option = options.find(option => option.value === value);
            return option ? option.label : value;
        });
    };

    const methodOptions = [
        { value: 'InPerson', label: 'In Person Sessions' },
        { value: 'Virtual', label: 'Virtual Sessions' },
    ]

    const capitaliseFirstLetter = (str) => {
        if (str === null || str === undefined) {
            return;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    useEffect(() => {
        const fetchRequestData = async () => {
            try {
                if (email) {
                    const response = await axios.get(`http://localhost:3001/getUserDetails?email=${email}`);
                    setMatchFname(response.data.user.fname);
                    setMatchSname(response.data.user.sname);
                    setMatchUserType(response.data.user.userType);
                }
            } catch (error) {
                console.error('Error fetching mentor data:', error);
                setErrorMessage('Error Fetching Mentor Information');
            }
        };
        fetchRequestData();
    }, [email]);

    useEffect(() => {
        const fetchRequestProfile = async () => {
            try {
                if (matchUserType !== '') {
        const userResponse = await axios.post('http://localhost:3001/getProfile', {
            email: email,
            userType: matchUserType,
        });

        setMatchProfile(userResponse.data.profile);
    }
} catch (error) {
    console.error('Error fetching mentor data:', error);
    setErrorMessage('Error Fetching Mentor Information');
}
        };
fetchRequestProfile();
    }, [email, matchUserType]);


    return (
        <>
            <div className="full-profile-container">
                <div className="profile-box">
                    <div className="full-profile-icon">
                        <img src={white} alt="White Profile Icon" />
                    </div>
                    <div className='error-message-profile-container'>
                        {errorMessage && <p className="error-message-profile">{errorMessage}</p>}
                    </div>
                    <div className="profile-header">
                        <h1>{matchFname && matchSname ? `${matchFname} ${matchSname}` : ''}</h1>
                        <p className="job-role">Job Role: {matchProfile && matchProfile.profileInfo.jobRole ? capitaliseFirstLetter(matchProfile.profileInfo.jobRole) : ''}</p>

                    </div>
                    <div className='match-profile-info'>
                        <div className="profile-info">
                            <p>Department: {matchProfile && matchProfile.profileInfo.department ? capitaliseFirstLetter(matchProfile.profileInfo.department) : ''}</p>
                            <p>Location: {matchProfile && matchProfile.profileInfo.officeLocation ? capitaliseFirstLetter(matchProfile.profileInfo.officeLocation) : ''}</p>
                            <p>Languages: {matchProfile && matchProfile.profileInfo.languages ? matchProfile.profileInfo.languages.join(', ') : ''}</p>
                        </div>
                        <div className="profile-info">
                            <p>Development Areas: {matchProfile && matchProfile.profileInfo.developmentAreas ? matchProfile.profileInfo.developmentAreas.join(', ') : ''}</p>
                            <p>Methods of Matching: {matchProfile && matchProfile.profileInfo.matchingMethods ? mapValuesToLabels(matchProfile.profileInfo.mentoringMethods, methodOptions).join(', ') : ''}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>

    );
};

export default FullProfile;
