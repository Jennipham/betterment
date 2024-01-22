import React from 'react';
import Header from '../utils/header';
import Footer from '../utils/footer';
import Modal from '../utils/modal';
import Select, { components } from 'react-select';
import '../styles/MentorMatches.css';
import white from '../images/profile-white.png';
import black from '../images/profile-black.png';
import connect from '../images/connect-icon.png';
import save from '../images/save-icon.png';
import reset from '../images/reset-icon.png';
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

const MentorMatches = () => {


    const navigate = useNavigate();

    const [user, setUser] = useState({
        firstName: sessionStorage.getItem('firstName') || 'User',
        lastName: sessionStorage.getItem('lastName') || '',
        userType: sessionStorage.getItem('userType') || '',
        email: sessionStorage.getItem('email') || '',
        jobRole: sessionStorage.getItem('jobRole') || '',
    });

    const [menteeProfile, setMenteeProfile] = useState(null);
    const [menteeFname, setMenteeFname] = useState('');
    const [menteeSname, setMenteeSname] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const [matchingMethod, setMatchingMethod] = useState('manual');


    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (menteeProfile) => {
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
        const fetchMenteeProfile = async () => {
            try {
                let response;

                if (matchingMethod === 'random') {
                    response = await axios.get('http://localhost:3001/getRandomMenteeProfile');
                    const userResponse = await axios.get(`http://localhost:3001/getUserDetails?email=${response.data.profile.email}`);
                    setMenteeProfile(response.data.profile);
                    setMenteeFname(userResponse.data.user.fname);
                    setMenteeSname(userResponse.data.user.sname);
                    sessionStorage.setItem('matchProfile', JSON.stringify(response.data.profile));

                }

                else if (matchingMethod === 'manual') {
                    response = await axios.get(`http://localhost:3001/getFilteredMenteeProfile`, {
                        params: {
                            language: selectedLanguages.join(','),
                            developmentAreas: selectedDevelopmentAreas.join(','),
                            mentoringMethods: selectedMethods.join(','),
                        },
                    });
                    setMenteeProfile(response.data.profile);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response && error.response.status === 404) {
                    setErrorMessage('No Mentors Currently Available - Please try again later.');
                } else {
                    setErrorMessage('Error Finding Match.');
                }
            }
        };

        fetchMenteeProfile();
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
                receiverEmail: menteeProfile.email, // Assuming you have the mentor's email in mentorProfile.email
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

    const handleLanguagesChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setSelectedLanguages(selectedValues);
    };

    const [selectedDevelopmentAreas, setSelectedDevelopmentAreas] = useState([]);

    const handleDevelopmentAreasChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setSelectedDevelopmentAreas(selectedValues);
    };

    const [selectedMethods, setSelectedMethods] = useState([]);

    const handleMethodsChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setSelectedMethods(selectedValues);
    };

    const [selectedLocation, setSelectedLocation] = useState('');

    const handleLocationChange = (selectedOption) => {
        const selectedValue = selectedOption ? selectedOption.value : '';
        setSelectedLocation(selectedValue);
    };


    const capitaliseFirstLetter = (str) => {
        if (str === null || str === undefined) {
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

    const handleSuccessMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => {
            setSuccessMessage('');
        }, 5000); // 5000 milliseconds (5 seconds)
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // Prepare the data to be saved
            const dataToSave = {
                languages: selectedLanguages,
                developmentAreas: selectedDevelopmentAreas,
                mentoringMethods: selectedMethods,
                officeLocation: selectedLocation,
            };

            // Send a PUT request to update the user's profile
            const response = await axios.put('http://localhost:3001/updateUserProfile', {
                email: user.email,
                userType: user.userType,
                data: dataToSave,
            });

            // Handle the response, update state, or perform any additional actions if needed
            console.log('Profile updated successfully:', response.data);
            setLoading(false);
            handleSuccessMessage('Profile Successfully Updated!');

        } catch (error) {
            setLoading(false);
            console.error('Error updating profile:', error);
            setErrorMessage('Error Updating Profile');
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    function chunkArray(array, size) {
        return array.reduce((chunks, item, index) => {
            if (index % size === 0) {
                chunks.push([item]);
            } else {
                chunks[chunks.length - 1].push(item);
            }
            return chunks;
        }, []);
    }

    return (
        <>
            <Header />

            <div className="mentor-profile-container">
                <div className='success-message-profile-container'>
                    {successMessage && <p className="success-message-profile">{successMessage}</p>}
                </div>
                {matchingMethod === 'manual' ? (
                    <>
                <div className="filter-section">
                    <Select
                        options={languageOptions}
                        placeholder={selectedLanguages.length > 0 ? `Languages (${selectedLanguages.length})` : 'Languages'}
                        styles={{ ...customStyles, ...customStylesWithCheckbox }}
                        isMulti={true}
                        hideSelectedOptions={false}
                        controlShouldRenderValue={false}
                        value={languageOptions.filter(option => selectedLanguages.includes(option.value))}
                        onChange={(selectedOptions) => handleLanguagesChange(selectedOptions)}
                    />


                    <Select
                        options={developmentAreaOptions}
                        placeholder={selectedDevelopmentAreas.length > 0 ? `Development Areas (${selectedDevelopmentAreas.length})` : 'Development Areas'}
                        styles={{ ...customStyles, ...customStylesWithCheckbox }}
                        isMulti={true}
                        hideSelectedOptions={false}
                        controlShouldRenderValue={false}
                        value={developmentAreaOptions.filter(option => selectedDevelopmentAreas.includes(option.value))}
                        onChange={(selectedOptions) => handleDevelopmentAreasChange(selectedOptions)}
                    />

                    <Select
                        options={methodOptions}
                        placeholder={selectedMethods.length > 0 ? `Mentoring Methods (${selectedMethods.length})` : 'Mentoring Methods'}
                        styles={{ ...customStyles, ...customStylesWithCheckbox }}
                        isMulti={true}
                        hideSelectedOptions={false}
                        controlShouldRenderValue={false}
                        value={methodOptions.filter(option => selectedMethods.includes(option.value))}
                        onChange={(selectedOptions) => handleMethodsChange(selectedOptions)}

                    />

                    <Select
                        isMulti={false}
                        options={locationOptions}
                        placeholder="Office Location"
                        styles={customStyles}
                        value={locationOptions.find(option => option.value === selectedLocation)}
                        onChange={(selectedOption) => handleLocationChange(selectedOption)}
                    />

                    <div className='save-icon'>
                        <img src={save} onClick={handleSave} alt="Save to Profile" title="Save to Profile" />
                    </div>

                    <div className='reset-icon'>
                        <img src={reset} onClick={handleReset} alt="Reset Filters" title="Reset Filters" />
                    </div>


                </div>

                <h2 className='top-match'>Your Matches:</h2>

                <div className="mentor-profiles">
                    {menteeProfile ? (
                        chunkArray(menteeProfile, 2).map((row, rowIndex) => (
                            <div key={rowIndex} className="mentor-profile-row">
                                {row.map((mentor, index) => (
                                    <div key={index} className="mentor-profiles-box">
                                        <div className="profile-mentor">
                                            <div className="profile-left-info">
                                                <div className='profile-top'>
                                                    <div className="profile-icon">
                                                        <img src={black} alt="Black Profile Icon" />
                                                    </div>
                                                    <div className="user-info">
                                                        <p>Name: {mentor.email}</p>
                                                        <p>Job Role: {mentor.profileInfo.jobRole ? capitaliseFirstLetter(mentor.profileInfo.jobRole) : 'Not specified'}</p>
                                                    </div>
                                                </div>

                                                <div className="matching-info-left">
                                                    <p>Location: {mentor.profileInfo.officeLocation ? capitaliseFirstLetter(mentor.profileInfo.officeLocation) : 'Not specified'}</p>
                                                    <p>Development Areas: {mentor.profileInfo.developmentAreas ? mentor.profileInfo.developmentAreas.join(', ') : 'Not specified'}</p>
                                                    <p>Methods of Matching: {mentor.profileInfo.mentoringMethods ? mentor.profileInfo.mentoringMethods.join(', ') : 'Not specified'}</p>
                                                </div>

                                                <div className="bottom-buttons-container-manual">
                                                    <button className="full-profile-button" onClick={() => openModal(menteeProfile)}>View Full Profile</button>
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
                                ))}
                            </div>


                        ))
                    ) : (
                        errorMessage && <p className="error-message-profile">{errorMessage}</p>
                    )}
                </div>
            </>
            ) : (
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
                                    <p>Name: {menteeFname && menteeSname ? `${menteeFname} ${menteeSname}` : ''}</p>
                                    <p>Job Role: {menteeProfile && menteeProfile.profileInfo.jobRole ? capitaliseFirstLetter(menteeProfile.profileInfo.jobRole) : ''}</p>
                                </div>
                            </div>

                            <div className="matching-info-right">
                                <p>Location: {menteeProfile && menteeProfile.profileInfo.officeLocation ? capitaliseFirstLetter(menteeProfile.profileInfo.officeLocation) : ''}</p>
                                <p>Development Areas: {menteeProfile && menteeProfile.profileInfo.developmentAreas ? menteeProfile.profileInfo.developmentAreas.join(', ') : ''}</p>
                                <p>Methods of Matching: {menteeProfile && menteeProfile.profileInfo.mentoringMethods ? mapValuesToLabels(menteeProfile.profileInfo.mentoringMethods, methodOptions).join(', ') : ''}</p>
                            </div>

                            <div className="bottom-buttons-container">
                                <button className="full-profile-button" onClick={() => openModal(menteeProfile)}>View Full Profile</button>
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
                    <button>Re-Match Me</button>
                </div>

            </div>
             )}

        </div >


            <Footer />
            </>
        );
};
export default MentorMatches;
