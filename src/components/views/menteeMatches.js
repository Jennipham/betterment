import React from 'react';
import Header from '../utils/header';
import Footer from '../utils/footer';
import Modal from '../utils/modal';
import Select, { components } from 'react-select';
import '../styles/MenteeMatches.css';
import white from '../images/profile-white.png';
import black from '../images/profile-black.png';
import connect from '../images/connect-icon.png';
import Loader from '../utils/loader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#3BBED1' : 'white',
        color: state.isSelected ? 'white' : 'black',
        fontFamily: 'agrandir wide light, sans- serif',

    }),
    menu: (provided) => ({
        ...provided,
        fontFamily: 'agrandir wide light, sans-serif',
    }),
};

const MenteeMatches = () => {


    const navigate = useNavigate();

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

    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);


    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (mentorProfile) => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };



    useEffect(() => {
        // Retrieve user information from sessionStorage
        const firstName = sessionStorage.getItem('firstName');
        const lastName = sessionStorage.getItem('lastName');
        const userType = sessionStorage.getItem('userType');
        const email = sessionStorage.getItem('email');
        const jobRole = sessionStorage.getItem('jobRole') || '';
        const officeLocation = sessionStorage.getItem('officeLocation') || '';
        const developmentAreas = sessionStorage.getItem('developmentAreas') || '';
        const mentoringMethods = sessionStorage.getItem('mentoringMethods') || '';
        const languages = sessionStorage.getItem('languages') || '';



        setUser({ firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
        // console.log('User Information:', { firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
    }, []);


    useEffect(() => {
        const fetchRandomMentorProfile = async () => {
            try {
                const response = await axios.get('http://localhost:3001/getRandomMentorProfile');
                setMentorProfile(response.data.profile);

                sessionStorage.setItem('matchProfile', JSON.stringify(response.data.profile));
                // console.log('match',sessionStorage.getItem('matchProfile'))

                const userResponse = await axios.get(`http://localhost:3001/getUserDetails?email=${response.data.profile.email}`);
                setMentorFname(userResponse.data.user.fname);
                setMentorSname(userResponse.data.user.sname);

            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorMessage('Error Finding Match.');

            }
        };

        fetchRandomMentorProfile();
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
                    location: response.data.profile.profileInfo.officeLocation || '',
                    developmentAreas: response.data.profile.profileInfo.developmentAreas || '',
                    mentoringMethods: response.data.profile.profileInfo.mentoringMethods || '',
                    languages: response.data.profile.profileInfo.languages || '',


                }));

                setSelectedLanguages(response.data.profile.profileInfo.languages);
                setSelectedDevelopmentAreas(response.data.profile.profileInfo.developmentAreas);
                setSelectedMethods(response.data.profile.profileInfo.mentoringMethods);
                setSelectedLocation(response.data.profile.profileInfo.officeLocation);


            } catch (error) {
                console.error('Error fetching profile data:', error);
                setErrorMessage('Error Fetching Profile Data');

            }
        };

        fetchProfileData();
    }, [user.email, user.userType]);

    const handleRequestMatch = async () => {
        try {
            setLoading(true);
            const currentDate = new Date();
            const expirationDate = new Date(currentDate);
            expirationDate.setDate(expirationDate.getDate() + 14);

            const response = await axios.post('http://localhost:3001/requestMatch', {
                senderEmail: user.email,
                receiverEmail: mentorProfile.email, // Assuming you have the mentor's email in mentorProfile.email
                expiration: expirationDate.toISOString(),
            });

            // Handle the response, update state, or perform any additional actions if needed
            console.log('Match request sent successfully:', response.data);
            setLoading(false);

        } catch (error) {
            setLoading(false);
            console.error('Error sending match request:', error);
            setErrorMessage('Error sending Match Request');
        }
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

    console.log('methods', selectedMethods);

    const [selectedLocation, setSelectedLocation] = useState('');

    const handleLocationChange = (selectedOption) => {
        // Assuming selectedOption is an object with a value property
        const selectedValue = selectedOption ? selectedOption.value : '';

        // Update the selectedLocation state
        setSelectedLocation(selectedValue);

        // You can perform additional actions if needed
        console.log('Selected Location:', selectedValue);
    };


    const capitaliseFirstLetter = (str) => {
        if (str === undefined) {
            return;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const handleEditClick = () => {
        if (user.userType === 'mentee' || user.userType === 'mentor') {
            console.log("Navigating to Profile with user:", user);
            navigate("/profileSettings", { state: { user: { fname: user.firstName, sname: user.lastName, userType: user.userType, email: user.email, } } })

        }
    };

    const mapValuesToLabels = (values, options) => {
        return values.map(value => {
            const option = options.find(option => option.value === value);
            return option ? option.label : value;
        });
    };

    return (
        <>
            <Header />

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
                        value={languageOptions.filter(option => selectedLanguages.includes(option.value))}
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
                        value={developmentAreaOptions.filter(option => selectedDevelopmentAreas.includes(option.value))}
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
                        value={methodOptions.filter(option => selectedMethods.includes(option.value))}
                        onChange={handleMethodsChange}

                    />

                    <Select
                        isMulti={false}
                        options={locationOptions}
                        placeholder="Office Location"
                        styles={customStyles}
                        value={selectedLocation} // Find the corresponding option
                        onChange={(selectedOption) => handleLocationChange(selectedOption)}
                    />


                </div>
                <div className="match-section">
                    <h2 className='top-match'>Your Top Match:</h2>
                    <div className='error-message-profile-container'>
                        {errorMessage && <p className="error-message-profile">{errorMessage}</p>}
                    </div>
                    <div className="user-profile-box">
                        <div className="profile-left">
                            <div className="profile-left-info">

                                <div className='profile-top' >
                                    <div className="profile-icon">
                                        <img src={black} alt="Black Profile Icon" />
                                    </div>
                                    <div className="user-info">
                                        <p>Name: {capitaliseFirstLetter(user.firstName)} {capitaliseFirstLetter(user.lastName)}</p>
                                        <p>Job Role: {capitaliseFirstLetter(user.jobRole)}</p>
                                    </div>
                                </div>

                                <div className="matching-info-left">
                                    <p>Location: {capitaliseFirstLetter(user.officeLocation)}</p>
                                    <p>Development Areas: {user.developmentAreas ? user.developmentAreas.join(', ') : ''}</p>
                                    <p>Methods of Matching: {user.mentoringMethods ? mapValuesToLabels(user.mentoringMethods, methodOptions).join(', ') : ''}</p>
                                </div>

                                <div className="bottom-right-button">
                                    <button onClick={() => { handleEditClick() }}>Edit Profile</button>
                                </div>
                            </div>
                        </div>


                        <div className="matching-icon">
                            {loading ? (
                                <Loader />
                            ) : (
                                <img src={connect} alt="Connect Icon" />
                            )}
                        </div>

                        <div className="profile-right">
                            <div className="profile-right-info">

                                <div className='profile-top' >
                                    <div className="profile-icon">
                                        <img src={white} alt="White Profile Icon" />
                                    </div>
                                    <div className="match-info">
                                        <p>Name: {mentorFname && mentorSname ? `${mentorFname} ${mentorSname}` : ''}</p>
                                        <p>Job Role: {mentorProfile && mentorProfile.profileInfo.jobRole ? capitaliseFirstLetter(mentorProfile.profileInfo.jobRole) : ''}</p>
                                    </div>
                                </div>

                                <div className="matching-info-right">
                                    <p>Location: {mentorProfile && mentorProfile.profileInfo.officeLocation ? capitaliseFirstLetter(mentorProfile.profileInfo.officeLocation) : ''}</p>
                                    <p>Development Areas: {mentorProfile && mentorProfile.profileInfo.developmentAreas ? mentorProfile.profileInfo.developmentAreas.join(', ') : ''}</p>
                                    <p>Methods of Matching: {mentorProfile && mentorProfile.profileInfo.mentoringMethods ? mapValuesToLabels(mentorProfile.profileInfo.mentoringMethods, methodOptions).join(', ') : ''}</p>
                                </div>

                                <div className="bottom-buttons-container">
                                    <button className="full-profile-button" onClick={() => openModal(mentorProfile)}>View Full Profile</button>
                                    {isModalOpen && (
                                        <Modal onClose={handleCloseModal}>
                                            <iframe title="Full Profile" src="/fullprofile" width="100%" height="100%" />
                                        </Modal>
                                    )}
                                    <button className='match-request-button' onClick={() => { handleRequestMatch() }}>Request Match</button>

                                </div>
                            </div>

                        </div>

                    </div>


                    <div className='other-matches'>
                        <button>See Other Matches</button>
                    </div>
                </div>


            </div>

            <Footer />
        </>
    );
};

export default MenteeMatches;
