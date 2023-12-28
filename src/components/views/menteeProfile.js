import React from 'react';
import Header from './header';
import Footer from './footer';
import Select, { components } from 'react-select';
import '../styles/MenteeMatches.css';
import white from '../images/profile-white.png';
import black from '../images/profile-black.png';
import connect from '../images/connect-icon.png';
import axios from 'axios';


import { useState, useEffect } from 'react';



const customStyles = {
    control: (provided) => ({
        ...provided,
        borderRadius: '12px',
        border: 'none',
        backgroundColor: 'white',
        fontFamily: 'agrandir wide light, sans- serif',
        fontWeight: 'bold',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'black',

    }),
    option: (provided) => ({
        ...provided,
        color: 'black', // Change the color of the dropdown options
        fontFamily: 'agrandir wide light, sans- serif',

    }),
    menu: (provided) => ({
        ...provided,
        fontFamily: 'agrandir wide light, sans-serif',
    }),
};

const MenteeMatches = () => {
    const [user, setUser] = useState({
        firstName: sessionStorage.getItem('firstName') || 'User',
        lastName: sessionStorage.getItem('lastName') || '',
        userType: sessionStorage.getItem('userType') || '',
        email: sessionStorage.getItem('email') || '',
        jobRole: sessionStorage.getItem('jobRole') || '',
    });

    useEffect(() => {
        // Retrieve user information from sessionStorage
        const firstName = sessionStorage.getItem('firstName');
        const lastName = sessionStorage.getItem('lastName');
        const userType = sessionStorage.getItem('userType');
        const email = sessionStorage.getItem('email');
        const jobRole = sessionStorage.getItem('jobRole') || '';

        setUser({ firstName, lastName, userType, email, jobRole });
        console.log('User Information:', { firstName, lastName, userType, email, jobRole });
    }, []);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.post('http://localhost:3001/getProfile', {
                    email: user.email,
                    userType: user.userType,
                });

                sessionStorage.setItem('profile', JSON.stringify(response.data.profile.profileInfo));

                // Update the user state with the latest jobRole
                setUser((prevUser) => ({
                    ...prevUser,
                    jobRole: response.data.profile.profileInfo.jobRole || '',
                }));

            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, [user.email, user.userType]);

    const languageOptions = [
        { value: 'afrikaans', label: 'Afrikaans' },
        { value: 'english', label: 'English' },
        { value: 'french', label: 'French' },
        { value: 'german', label: 'German' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'hungarian', label: 'Hungarian' },
        { value: 'italian', label: 'Italian' },
        { value: 'marathi', label: 'Marathi' },
        { value: 'italian', label: 'Italian' },
        { value: 'portuguese', label: 'Portuguese' },
        { value: 'romanian', label: 'Romanian' },
        { value: 'spanish', label: 'Spanish' },
        { value: 'swedish', label: 'Swedish' },
        { value: 'turkish', label: 'Turkish' },
    ];

    const locationOptions = [
        { value: 'city1', label: 'City 1' },
        { value: 'city2', label: 'City 2' },
        // Add more location options as needed
    ];

    const developmentAreaOptions = [
        { value: 'career', label: 'Career Decision' },
        { value: 'communication', label: 'Communication' },
        { value: 'confidence', label: 'Confidence' },
        { value: 'conflict', label: 'Conflict' },
        { value: 'goals', label: 'Goal Setting' },
        { value: 'obstacles', label: 'Obstacles' },
        { value: 'resilience', label: 'Resilience' },
        { value: 'stakeholders', label: 'Stakeholder Conversations' },
        { value: 'time', label: 'Time Management' },
        { value: 'wellbeing', label: 'Wellbeing' },
        { value: 'balance', label: 'Work / Life Balance' },
    ]

    const methodOptions = [
        { value: 'inPerson', label: 'In Person Sessions' },
        { value: 'virtual', label: 'Virtual Sessions' },
    ]

    const CheckboxOption = ({ innerProps, label, isSelected, selectProps }) => (
        <div {...innerProps}>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => selectProps.onChange({ label })} // Use selectProps.onChange
            />
            <span onClick={() => selectProps.onChange({ label })}>{label}</span>
        </div>
    );


    const customStylesWithCheckbox = {
        // ... your existing styles ...
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3BBED1' : 'white',
            color: state.isSelected ? 'white' : 'black',
            fontFamily: 'agrandir wide light, sans- serif',


        }),
    };
    const [selectedLanguages, setSelectedLanguages] = useState([]);

    const handleLanguagesChange = (selectedOption) => {
        setSelectedLanguages(selectedOption);
    };

    const [selectedDevelopmentAreas, setSelectedDevelopmentAreas] = useState([]);

    const handleDevelopmentAreasChange = (selectedOption) => {
        setSelectedDevelopmentAreas(selectedOption);
    };

    const [selectedMethods, setSelectedMethods] = useState([]);

    const handleMethodsChange = (selectedOption) => {
        setSelectedMethods(selectedOption);
    };

    const capitaliseFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <>
            <Header loggedIn={true} />

            <div className="mentee-profile-container">
                <div className="filter-section">
                    <Select
                        options={languageOptions}
                        placeholder={selectedLanguages.length > 0 ? `Languages (${selectedLanguages.length})` : 'Languages'}
                        styles={{ ...customStyles, ...customStylesWithCheckbox }}
                        isMulti={true}
                        hideSelectedOptions={false}
                        controlShouldRenderValue={false}
                        components={{
                            MultiValue: CheckboxOption,
                        }}
                        value={selectedLanguages}
                        onChange={handleLanguagesChange}
                    />

                    <Select
                        options={developmentAreaOptions}
                        placeholder={selectedDevelopmentAreas.length > 0 ? `Development Areas (${selectedDevelopmentAreas.length})` : 'Development Areas'}
                        styles={{ ...customStyles, ...customStylesWithCheckbox }}
                        isMulti={true}
                        hideSelectedOptions={false}
                        controlShouldRenderValue={false}
                        components={{
                            MultiValue: CheckboxOption,
                        }}
                        value={selectedDevelopmentAreas}
                        onChange={handleDevelopmentAreasChange}

                    />

                    <Select
                        options={methodOptions}
                        placeholder={selectedMethods.length > 0 ? `Mentoring Methods (${selectedMethods.length})` : 'Mentoring Methods'}
                        styles={{ ...customStyles, ...customStylesWithCheckbox }}
                        isMulti={true}
                        hideSelectedOptions={false}
                        controlShouldRenderValue={false}
                        components={{
                            MultiValue: CheckboxOption,
                        }}
                        value={selectedMethods}
                        onChange={handleMethodsChange}

                    />

                    <Select
                        options={locationOptions}
                        placeholder="Location"
                        styles={customStyles}

                    />

                   
                </div>
                <div className="match-section">
                    <h2 className='top-match'>Your Top Match:</h2>

                    <div className="user-profile-box">
                        <div className="profile-left">
                            <div className="profile-icon">
                                <img src={black} alt="Black Profile Icon" />
                            </div>
                            <div className="user-info">
                                <p>Name: {capitaliseFirstLetter(user.firstName)} {capitaliseFirstLetter( user.lastName)}</p>
                                <p>Job Role: {capitaliseFirstLetter(user.jobRole)}</p>
                            </div>
                            <div className="matching-info-left">
                                <p>Location:</p>
                                <p>Development Areas:</p>
                                <p>Methods of Matching:</p>
                            </div>
                        </div>

                        <div className="matching-icon">
                            <img src={connect} alt="Connect Icon" />
                        </div>

                        <div className="mentor-profile-box">
                          <div className="profile-right">
                                <div className="profile-icon">
                                    <img src={white} alt="White Profile Icon" />
                                </div>
                                    <div className="match-info">
                                        <p>Name:</p>
                                        <p>Job Role:</p>
                                    </div>
                                <div className="matching-info-right">
                                    <p>Location:</p>
                                    <p>Development Areas:</p>
                                        <p>Methods of Matching:</p>
                                    </div>
                                </div>
                        </div>
                    </div>
                    <button>See Other Matches</button>

                </div>
            </div>

            <Footer />
        </>
    );
};

export default MenteeMatches;
