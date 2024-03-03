import React from 'react';
import Header from '../utils/header';
import Footer from '../utils/footer';
import Modal from '../utils/modal';
import Select, { components } from 'react-select';
import '../styles/MenteeMatches.css';
import white from '../images/profile-white.png';
import black from '../images/profile-black.png';
import connect from '../images/connect-icon.png';
import star from '../images/star-icon.png';
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

const findHighestScore = (profiles, matchingMethod) => {
    if (profiles && matchingMethod === 'Algorithm') {
        return Math.max(...profiles.map(mentor => mentor.score), 0);
    } else {
        return 0;
    }
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

    const [mentorProfile, setMentorProfile] = useState([]);
    const [rankedMentorProfiles, setRankedMentorProfiles] = useState([]);
    const [mentorFname, setMentorFname] = useState('');
    const [mentorSname, setMentorSname] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const [matchingMethod, setMatchingMethod] = useState();
    const [blindMatching, setBlindMatching] = useState('');
    const [hasMatch, setHasMatch] = useState(false);
    const [names, setNames] = useState({});

    const handleShortlistClick = () => {
        navigate('/requests');
    };

    const highestScore = findHighestScore(mentorProfile, matchingMethod);
    useEffect(() => {
        if (matchingMethod === "Algorithm") {
            let currentRank = 1;
            let lastScore = highestScore; // Start with the highest score

            const newRankedProfiles = mentorProfile.map(mentee => {
                let rank;
                if (mentee.score === highestScore) {
                    rank = 'Top Match';
                } else {
                    if (mentee.score !== lastScore) {
                        currentRank++;
                        lastScore = mentee.score;
                    }
                    rank = `Ranking: ${currentRank}`;
                }
                return { ...mentee, rank };
            });

            setRankedMentorProfiles(newRankedProfiles);
        }
    }, [mentorProfile, matchingMethod, highestScore]);

    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

    const [selectedMentorEmail, setSelectedMentorEmail] = useState('');

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



    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);

    };

    const handleViewFullProfile = (mentorEmail) => {
        setSelectedMentorEmail(mentorEmail);
        openModal();
    };


    useEffect(() => {
        // Retrieve user information from sessionStorage
        const firstName = sessionStorage.getItem('firstName');
        const lastName = sessionStorage.getItem('lastName');
        const userType = sessionStorage.getItem('userType');
        const email = sessionStorage.getItem('email');
        const jobRole = sessionStorage.getItem('jobRole') || '';
        const officeLocation = sessionStorage.getItem('officeLocation') || '';
        const developmentAreas = sessionStorage.getItem('developmentAreas') || [];
        const mentoringMethods = sessionStorage.getItem('mentoringMethods') || [];
        const department = sessionStorage.getItem('department') || '';
        const languages = sessionStorage.getItem('languages') || [];
        const admin = sessionStorage.getItem('admin') || '';

        setUser({ firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, department, mentoringMethods, languages, admin, });
        // console.log('User Information:', { firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
    }, []);

    const fetchAdminMatchSettings = async () => {
        try {
            const response = await axios.get('http://localhost:3001/getAdminMatchingSettings', {
                params: {
                    email: user.admin,
                },
            });
            const { blindMatching, matchingMethod } = response.data;

            setBlindMatching(blindMatching);
            setMatchingMethod(matchingMethod);
        } catch (error) {
            console.error('Error fetching admin match settings:', error);
            // Handle error if necessary
        }
    };

    useEffect(() => {

        if (user.admin) {
            fetchAdminMatchSettings();
        }
        else {
            setBlindMatching('On');
        }
    }, [user.admin]);

    useEffect(() => {
        const fetchMentorProfile = async () => {
            try {
                let response;

                if (matchingMethod && matchingMethod === 'Random') {
                    response = await axios.get(`http://localhost:3001/getRandomMentorProfile?email=${user.email}`);

                    const userResponse = await axios.get(`http://localhost:3001/getUserDetails?email=${response.data.profile.email}`);
                    setMentorProfile(response.data.profile);
                    setMentorFname(userResponse.data.user.fname);
                    setMentorSname(userResponse.data.user.sname);
                    sessionStorage.setItem('matchProfile', JSON.stringify(response.data.profile));

                }

                else if (matchingMethod && matchingMethod === 'Algorithm') {
                    response = await axios.get('http://localhost:3001/getPotentialMatches', {
                        params: {
                            email: user.email,
                            userType: user.userType,
                            languages: user.languages.join(','),
                            department: user.department,
                            officeLocation: user.officeLocation,
                            developmentAreas: user.developmentAreas.join(','),
                            mentoringMethods: user.mentoringMethods.join(','),

                        },
                    });

                    const isMatch = response.data.isMatch;
                    setHasMatch(isMatch);


                    if (!isMatch) {


                        const menteeProfilesWithNames = await Promise.all(
                            response.data.profiles.map(async (mentor) => {
                                const userDetailsResponse = await fetchNames(mentor._doc.email);
                                return {
                                    ...mentor,
                                    fname: userDetailsResponse ? userDetailsResponse.user.fname : '',
                                    sname: userDetailsResponse ? userDetailsResponse.user.sname : '',
                                };
                            })
                        );

                        setMentorProfile(menteeProfilesWithNames);
                    }

                    if (isMatch) {

                        const menteeProfilesWithNames = await Promise.all(
                            response.data.profiles.map(async (mentee) => {
                                const userDetailsResponse = await fetchNames(mentee.email);
                                return {
                                    ...mentee,
                                    fname: userDetailsResponse ? userDetailsResponse.user.fname : '',
                                    sname: userDetailsResponse ? userDetailsResponse.user.sname : '',
                                };
                            })
                        );
                        setMentorProfile(menteeProfilesWithNames);


                    }


                    setIsLoadingProfiles(false);

                    // Update sessionStorage if necessary
                    sessionStorage.setItem('matchProfile', JSON.stringify(response.data.profiles));

                }

            } catch (error) {
                setIsLoadingProfiles(false);
                console.error('Error fetching data:', error);
                if (error.response && error.response.status === 404) {
                    handleErrorMessage('No Mentors Currently Available - Please try again later.');
                } else {
                    handleErrorMessage('Error Finding Match.');
                }
            }
        };


        setIsLoadingProfiles(true);
        fetchMentorProfile();
    }, [matchingMethod, user]);

    const fetchNames = async (email) => {
        try {
            const response = await axios.get(`http://localhost:3001/getuserdetails?email=${email}`);
            const userDetails = response.data;

            if (userDetails) {
                return userDetails;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchManualMatches = async () => {
            try {
                if (matchingMethod && matchingMethod === 'Manual') {

                    const response = await axios.get(`http://localhost:3001/getFilteredMentorProfile?email=${user.email}`, {
                        params: {
                            language: selectedLanguages.join(','),
                            developmentAreas: selectedDevelopmentAreas.join(','),
                            mentoringMethods: selectedMethods.join(','),
                        },
                    });

                    const isMatch = response.data.isMatch;
                    setHasMatch(isMatch);

                    // Fetch names for each mentor profile
                    const mentorProfilesWithNames = await Promise.all(
                        response.data.profiles.map(async (mentor) => {
                            const userDetailsResponse = await fetchNames(mentor.email);
                            return {
                                ...mentor,
                                fname: userDetailsResponse ? userDetailsResponse.user.fname : '',
                                sname: userDetailsResponse ? userDetailsResponse.user.sname : '',
                            };
                        })
                    );

                    setMentorProfile(mentorProfilesWithNames);
                    setIsLoadingProfiles(false);
                    sessionStorage.setItem('matchProfile', JSON.stringify(response.data.profiles));

                }

            } catch (error) {
                setIsLoadingProfiles(false);
                setMentorProfile([]);
                console.error('Error fetching data:', error);
                if (error.response && error.response.status === 404) {
                    handleErrorMessage('No Mentors Currently Available - Please try again later.');
                } else {
                    handleErrorMessage('Error Finding Match.');
                }
            }
        };

        // Only fetch when the matching method is manual
        if (matchingMethod === 'Manual') {
            setIsLoadingProfiles(true);
            fetchManualMatches();
        }
    }, [matchingMethod, selectedLanguages, selectedDevelopmentAreas, selectedMethods, user]);


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
                    developmentAreas: response.data.profile.profileInfo.developmentAreas || [],
                    mentoringMethods: response.data.profile.profileInfo.mentoringMethods || [],
                    languages: response.data.profile.profileInfo.languages || [],
                    admin: response.data.profile.profileInfo.admin || '',
                    department: response.data.profile.profileInfo.department || '',


                }));

                setSelectedLanguages(response.data.profile.profileInfo.languages);
                setSelectedDevelopmentAreas(response.data.profile.profileInfo.developmentAreas);
                setSelectedMethods(response.data.profile.profileInfo.mentoringMethods);
                setSelectedLocation(response.data.profile.profileInfo.officeLocation);


            } catch (error) {
                console.error('Error fetching profile data:', error);
                handleErrorMessage('Error Fetching Profile Data');

            }
        };

        fetchProfileData();
    }, []);

    const handleRequestMatch = async (mentorEmail) => {
        try {
            setLoading(true);


            const response = await axios.post('http://localhost:3001/requestMatch', {
                senderEmail: user.email,
                receiverEmail: mentorEmail,
                userType: user.userType,
            });

            setSuccessMessage('Match request sent successfully!');
            console.log('Match request sent successfully:', response.data);
            setLoading(false);

            navigate("/requests");

        } catch (error) {
            setLoading(false);
            if (error.response) {
                if (error.response.status === 400) {
                    handleErrorMessage('Invalid user type - Please try again later.');
                } else if (error.response.status === 404) {
                    handleErrorMessage('Profile not found - please try again later.');
                }
                else if (error.response.status === 401) {
                    handleErrorMessage('Match request already sent or received');
                }
                else {
                    console.error('Error sending match request:', error);
                    handleErrorMessage('Error sending Match Request');
                }
            }

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

    const officeLocationOptions = [
        { value: 'London', label: 'London' },
        { value: 'Birmingham', label: 'Birmingham' },
        { value: 'Glasgow', label: 'Glasgow' },
        { value: 'Liverpool', label: 'Liverpool' },
        { value: 'Bristol', label: 'Bristol' },
        { value: 'Manchester', label: 'Manchester' },
        { value: 'Sheffield', label: 'Sheffield' },
        { value: 'Leeds', label: 'Leeds' },
        { value: 'Edinburgh', label: 'Edinburgh' },
        { value: 'Leicester', label: 'Leicester' },
        { value: 'Coventry', label: 'Coventry' },
        { value: 'Bradford', label: 'Bradford' },
        { value: 'Cardiff', label: 'Cardiff' },
        { value: 'Belfast', label: 'Belfast' },
        { value: 'Nottingham', label: 'Nottingham' },
    ]

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
                onChange={() => selectProps.onChange(selectProps.value)} // Use selectProps.onChange with the correct value
            />
            <span onClick={() => selectProps.onChange(selectProps.value)}>{label}</span>
        </div>
    );


    const customStylesWithCheckbox = {
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3BBED1' : 'white',
            color: state.isSelected ? 'white' : 'black',
            fontFamily: 'agrandir wide light, sans- serif',


        }),
    };

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

    const handleErrorMessage = (message) => {
        setErrorMessage(message);
        setTimeout(() => {
            setErrorMessage('');
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
            handleErrorMessage('Error Updating Profile');
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

    useEffect(() => {
        console.log('Selected Mentor Email:', selectedMentorEmail);
    }, [selectedMentorEmail]);

    console.log('Matching Method:', matchingMethod);

    console.log('mentor profiles', mentorProfile);


    const handleContactMatch = (matchEmail, mentorFname) => {
        // Replace these variables with actual values
        const userEmail = user.email; // User's email
        const subject = 'We have been matched on BetterMent!'; // Subject of the email

        const body = `Dear ${mentorFname}, \n \n I hope this message finds you well. I'm excited about our mentoring partnership on BetterMent and would like to schedule our first meeting. \n \n Best regards,\n ${user.firstName}.`;
        const mailtoLink = `mailto:${matchEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Open the default email client with the pre-filled email template
        window.location.href = mailtoLink;
    };

    return (
        <>
            <Header />

            <div className="mentee-profile-container">

                <div className='success-message-profile-container'>
                    {successMessage && <p className="success-message-profile">{successMessage}</p>}
                </div>
                <div className='error-message-profile-container'>
                    {errorMessage && <p className="error-message-profile">{errorMessage}</p>}
                </div>

                {matchingMethod === 'Manual' && !hasMatch && (
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
                                options={officeLocationOptions}
                                placeholder="Office Location"
                                styles={customStyles}
                                value={officeLocationOptions.find(option => option.value === selectedLocation)}
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


                        {isLoadingProfiles ? (
                            <div className="loader-container">
                                <Loader />
                            </div>
                        ) : (
                            <div className="mentor-profiles">
                                {mentorProfile ? (
                                    chunkArray(mentorProfile, 2).map((row, rowIndex) => (
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
                                                                    {blindMatching === "Off" ? (
                                                                        <p>Name: {mentor && mentor.fname && mentor.sname ? capitaliseFirstLetter(mentor.fname) + ' ' + capitaliseFirstLetter(mentor.sname) : 'Not specified'}</p>
                                                                    ) : (<p>Names are hidden for Blind Matching</p>
                                                                    )}
                                                                    <p>Job Role: {mentor.profileInfo && mentor.profileInfo.jobRole ? capitaliseFirstLetter(mentor.profileInfo.jobRole) : 'Not specified'}</p>
                                                                </div>
                                                            </div>

                                                            <div className="matching-info-left">
                                                                <p>Location: {mentor.profileInfo && mentor.profileInfo.officeLocation ? capitaliseFirstLetter(mentor.profileInfo.officeLocation) : 'Not specified'}</p>
                                                                <p>Development Areas: {mentor.profileInfo && mentor.profileInfo.developmentAreas ? mentor.profileInfo.developmentAreas.join(', ') : 'Not specified'}</p>
                                                                <p>Methods of Matching: {mentor.profileInfo && mentor.profileInfo.mentoringMethods ? mentor.profileInfo.mentoringMethods.join(', ') : 'Not specified'}</p>
                                                            </div>

                                                            <div className="bottom-buttons-container-manual">
                                                                <button className="full-profile-button" onClick={() => handleViewFullProfile(mentor.email)}>View Full Profile</button>
                                                                {isModalOpen && (
                                                                    <Modal onClose={handleCloseModal}>
                                                                        <iframe title="Full Profile" src={`/fullprofile/${selectedMentorEmail}`} width="100%" height="100%">
                                                                        </iframe>
                                                                    </Modal>

                                                                )}
                                                                <button className='match-request-button' onClick={() => { handleRequestMatch(mentor.email) }}>Request Match</button>

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
                        )}
                    </>
                )}


                {(matchingMethod === 'Manual' || matchingMethod === 'Algorithm') && hasMatch && mentorProfile && mentorProfile[0] && (
                    <div className="match-section">
                        <h2 className='top-match'>You've been Matched!</h2>
                        <div className="user-profile-box">
                            <div className="profile-left">
                                <div className="profile-left-info">

                                    <div className='profile-top' >
                                        <div className="profile-icon">
                                            <img src={black} alt="Black Profile Icon" />
                                        </div>
                                        <div className="user-info">
                                            <p>Name: {user.firstName && user.lastName ? capitaliseFirstLetter(user.firstName) + ' ' + capitaliseFirstLetter(user.lastName) : ''}</p>
                                            <p>Job Role: {user.jobRole ? capitaliseFirstLetter(user.jobRole) : ''}</p>
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

                                    <div className='profile-top'>
                                        <div className="profile-icon">
                                            <img src={white} alt="White Profile Icon" />
                                        </div>
                                        <div className="match-info">
                                            {blindMatching === 'Off' ? (
                                                <p>Name: {mentorProfile && mentorProfile[0] && mentorProfile[0].profileInfo && mentorProfile[0].fname && mentorProfile[0].sname ? `${mentorProfile[0].fname} ${mentorProfile[0].sname}` : ''}</p>) : <p>Names are hidden for Blind Matching</p>}
                                            <p>Job Role: {mentorProfile && mentorProfile[0].profileInfo && mentorProfile[0].profileInfo.jobRole ? capitaliseFirstLetter(mentorProfile[0].profileInfo.jobRole) : ''}</p>
                                        </div>
                                    </div>

                                    <div className="matching-info-right">
                                        <p>Location: {mentorProfile[0].profileInfo && mentorProfile[0].profileInfo.officeLocation ? capitaliseFirstLetter(mentorProfile[0].profileInfo.officeLocation) : ''}</p>
                                        <p>Development Areas: {mentorProfile[0].profileInfo && mentorProfile[0].profileInfo.developmentAreas ? mentorProfile[0].profileInfo.developmentAreas.join(', ') : ''}</p>
                                        <p>Methods of Matching: {mentorProfile[0].profileInfo && mentorProfile[0].profileInfo.mentoringMethods ? mapValuesToLabels(mentorProfile[0].profileInfo.mentoringMethods, methodOptions).join(', ') : ''}</p>
                                    </div>

                                    <div className="bottom-buttons-container">
                                        <button className="full-profile-button" onClick={() => openModal()}>View Full Profile</button>
                                        {isModalOpen && (
                                            <Modal onClose={handleCloseModal}>
                                                <iframe title="Full Profile" src={`/fullprofile/${mentorProfile[0].email}`} width="100%" height="100%">
                                                </iframe>
                                            </Modal>
                                        )}

                                        <button onClick={() => handleContactMatch(mentorProfile[0].email, mentorProfile[0].fname)}>Contact Match</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {matchingMethod === "Algorithm" && !hasMatch && (
                    <>
                        <h2 className='top-match'>Your Matches:</h2>
                        {isLoadingProfiles ? (
                            <div className="loader-container">
                                <Loader />
                            </div>
                        ) : (
                            <div className="mentor-profiles">
                                {rankedMentorProfiles ? (
                                    chunkArray(rankedMentorProfiles, 2).map((row, rowIndex) => (
                                        <div key={rowIndex} className="mentor-profile-row">
                                            {row.map((mentor, index) => (

                                                <div key={index} className="profile-containers">
                                                    <div className="rank-number">
                                                        {mentor.rank === 'Top Match' ? (
                                                            <p className='top-match-label'>
                                                                <img className="star-icon" src={star} alt="Star" />
                                                                Top Match
                                                            </p>
                                                        ) : (
                                                            <p className='top-match-label'>{mentor.rank}</p>
                                                        )}
                                                    </div>

                                                    <div className="mentor-profiles-box">
                                                        <div className="profile-mentor">

                                                            <div className="profile-left-info">

                                                                <div className='profile-top'>
                                                                    <div className="profile-icon">
                                                                        <img src={black} alt="Black Profile Icon" />
                                                                    </div>
                                                                    <div className="user-info">
                                                                        {blindMatching === "Off" ? (
                                                                            <p>Name: {mentor && mentor.fname && mentor.sname ? capitaliseFirstLetter(mentor.fname) + ' ' + capitaliseFirstLetter(mentor.sname) : 'Not specified'}</p>
                                                                        ) : (<p>Names are hidden for Blind Matching</p>)}
                                                                        <p>Job Role: {mentor._doc && mentor._doc.profileInfo && mentor._doc.profileInfo.jobRole ? capitaliseFirstLetter(mentor._doc.profileInfo.jobRole) : 'Not specified'}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="matching-info-left">
                                                                    <p>Location: {mentor._doc && mentor._doc.profileInfo && mentor._doc.profileInfo.officeLocation ? capitaliseFirstLetter(mentor._doc.profileInfo.officeLocation) : 'Not specified'}</p>
                                                                    <p>Development Areas: {mentor._doc && mentor._doc.profileInfo && mentor._doc.profileInfo.developmentAreas ? mentor._doc.profileInfo.developmentAreas.join(', ') : 'Not specified'}</p>
                                                                    <p>Methods of Matching: {mentor._doc && mentor._doc.profileInfo && mentor._doc.profileInfo.mentoringMethods ? mentor._doc.profileInfo.mentoringMethods.join(', ') : 'Not specified'}</p>
                                                                </div>

                                                                <div className="bottom-buttons-container-manual">
                                                                    <button className="full-profile-button" onClick={() => handleViewFullProfile(mentor._doc.email)}>View Full Profile</button>
                                                                    {isModalOpen && (
                                                                        <Modal onClose={handleCloseModal}>
                                                                            <iframe title="Full Profile" src={`/fullprofile/${selectedMentorEmail}`} width="100%" height="100%" />
                                                                        </Modal>
                                                                    )}
                                                                    <button className='match-request-button' onClick={() => { handleRequestMatch(mentor._doc.email) }}>Request Match</button>
                                                                </div>
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
                        )}
                    </>
                )}

                {matchingMethod === "Random" && (
                    <div className="match-section">
                        <h2 className='top-match'>Your Random Match:</h2>
                        <div className="user-profile-box">
                            <div className="profile-left">
                                <div className="profile-left-info">

                                    <div className='profile-top' >
                                        <div className="profile-icon">
                                            <img src={black} alt="Black Profile Icon" />
                                        </div>
                                        <div className="user-info">
                                            <p>Name: {user.firstName && user.lastName ? capitaliseFirstLetter(user.firstName) + ' ' + capitaliseFirstLetter(user.lastName) : ''}</p>
                                            <p>Job Role: {user.jobRole ? capitaliseFirstLetter(user.jobRole) : ''}</p>
                                        </div>
                                    </div>

                                    <div className="matching-info-left">
                                        <p>Location: {capitaliseFirstLetter(user.location)}</p>
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
                                            {blindMatching === 'Off' ? (
                                                <p>Name: {mentorFname && mentorSname ? `${mentorFname} ${mentorSname}` : ''}</p>) : <p>Names are hidden for Blind Matching</p>}
                                            <p>Job Role: {mentorProfile.profileInfo && mentorProfile.profileInfo.jobRole ? capitaliseFirstLetter(mentorProfile.profileInfo.jobRole) : ''}</p>
                                        </div>
                                    </div>

                                    <div className="matching-info-right">
                                        <p>Location: {mentorProfile.profileInfo && mentorProfile.profileInfo.officeLocation ? capitaliseFirstLetter(mentorProfile.profileInfo.officeLocation) : ''}</p>
                                        <p>Development Areas: {mentorProfile.profileInfo && mentorProfile.profileInfo.developmentAreas ? mentorProfile.profileInfo.developmentAreas.join(', ') : ''}</p>
                                        <p>Methods of Matching: {mentorProfile.profileInfo && mentorProfile.profileInfo.mentoringMethods ? mapValuesToLabels(mentorProfile.profileInfo.mentoringMethods, methodOptions).join(', ') : ''}</p>
                                    </div>

                                    <div className="bottom-buttons-container">
                                        <button className="full-profile-button" onClick={() => openModal()}>View Full Profile</button>
                                        {isModalOpen && (
                                            <Modal onClose={handleCloseModal}>
                                                <iframe title="Full Profile" src={`/fullprofile/${mentorProfile.email}`} width="100%" height="100%">
                                                </iframe>

                                            </Modal>
                                        )}

                                        {matchingMethod === 'Manual' ? (
                                            <button className='match-request-button' onClick={() => { handleRequestMatch(mentorProfile.email) }}>Request Match</button>) :
                                            <button onClick={() => handleContactMatch(mentorProfile.email, mentorFname)}>Contact Match</button>}

                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>


                )}
                {matchingMethod !== 'Random' ?
                    (<button className='view-shortlist' onClick={handleShortlistClick}>View Shortlist</button>) :
                    (<button className='view-shortlist' onClick={handleShortlistClick}>Complete Feedback Questionnaire</button>) 
                }

            </div >


            <Footer />
        </>
    );
};

export default MenteeMatches;
