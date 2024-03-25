import React from 'react';
import Header from '../../utils/header';
import Footer from '../../utils/footer';
import Loader from '../../utils/loader';
import editIcon from '../../images/EditIcon.png';
import cross from '../../images/cross-icon.png';
import tick from '../../images/tick-icon.png';
import moreInfo from '../../images/more-info1.png';
import Tooltip from '../../utils/tooltip';
import Select from 'react-select';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/ProfileSettings.css';
import { useNavigate } from 'react-router-dom';


const blindMatchingOptions = [
    { value: 'On', label: 'On' },
    { value: 'Off', label: 'Off' },
]

const matchingMethodOptions = [
    { value: 'Algorithm', label: 'BetterMent Algorithm' },
    { value: 'Manual', label: 'Manual Matching' },
    { value: 'Random', label: 'Random Matching' },
]

const customStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: 'white', // Change the background color of the control
        fontFamily: 'agrandir wide light, sans- serif',
        fontWeight: 'bold',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'black', // Change the color of the placeholder text
    }),
    option: (provided) => ({
        ...provided,
        color: 'black', // Change the color of the dropdown options
    }),
};

const AdminSettings = () => {

    const [user, setUser] = useState({
        firstName: sessionStorage.getItem('firstName') || 'User',
        lastName: sessionStorage.getItem('lastName') || '',
        userType: sessionStorage.getItem('userType') || '',
        email: sessionStorage.getItem('email') || '',
    });

    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve user information from sessionStorage
        const firstName = sessionStorage.getItem('firstName');
        const lastName = sessionStorage.getItem('lastName');
        const userType = sessionStorage.getItem('userType');
        const email = sessionStorage.getItem('email');

        setUser({ firstName, lastName, userType, email });
    }, []);


    const [formData, setFormData] = useState({
        orgName: '',
        matchingMethod: 'Algorithm',
        blindMatching: 'On',
    });

    const [isEditingOrgName, setIsEditingOrgName] = useState(false);
    const [orgNameInput, setOrgNameInput] = useState('');

    const [isEditingMatchingMethod, setIsEditingMatchingMethod] = useState(false);
    const [matchingMethodInput, setMatchingMethodInput] = useState([]);

    const [isEditingBlindMatching, setIsEditingBlindMatching] = useState(false);
    const [blindMatchingInput, setBlindMatchingInput] = useState(true);

    const [saveMessage, setSaveMessage] = useState(null);
    const [loading, setLoading] = useState(false);



    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.post('http://localhost:3001/getManagerProfile', {
                    email: user.email,
                    userType: user.userType,
                });

                setFormData((prevData) => ({
                    ...prevData,
                    ...response.data.profile.profileInfo,

                }));
                sessionStorage.setItem('profile', JSON.stringify(response.data.profile.profileInfo));

            } catch (error) {
                setErrorMessage('Error Fetching Profile Data');
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, [user.email, user.userType]);


    const handleInputChange = (field, value) => {
        setFormData((prevData) => ({ ...prevData, [field]: value }));
    };

    const handleEditClick = (attribute) => {

        if (attribute === 'OrgName') {
            setIsEditingOrgName(true);
        }

        if (attribute === 'matchingMethod') {
            setIsEditingMatchingMethod(true);
        }

        if (attribute === 'blindMatching') {
            setIsEditingBlindMatching(true);
        }
    };



    const handleSaveClick = async () => {
        setLoading(true);

        try {
            // Send the form data to the backend API endpoint
            const updatedOrgName = isEditingOrgName ? orgNameInput.trim() : formData.orgName.trim();
            const updatedMatchingMethod = isEditingMatchingMethod ? matchingMethodInput.trim() : formData.matchingMethod.trim();
            const updatedBlindMatching = isEditingBlindMatching ? blindMatchingInput.trim() : formData.blindMatching.trim();


            const response = await axios.post('http://localhost:3001/managerProfile', {
                ...formData,
                email: user.email,
                userType: user.userType,
                orgName: updatedOrgName,
                matchingMethod: updatedMatchingMethod,
                blindMatching: updatedBlindMatching,

            });

            // Update formData with the response from the server
            setFormData((prevData) => ({
                ...prevData,
                orgName: response.data.orgName || updatedOrgName,
                matchingMethod: response.data.matchingMethod || updatedMatchingMethod,
                blindMatching: response.data.blindMatching || updatedBlindMatching,
            }));

            setIsEditingOrgName(false);
            setIsEditingMatchingMethod(false);
            setIsEditingBlindMatching(false);

            setLoading(false);

            setSaveMessage('Profile saved successfully');

            setTimeout(() => {
                setSaveMessage(null);
            }, 5000);

             navigate("/dashboard");

            console.log('Profile saved successfully:', response.data);
        } catch (error) {
            console.error('Error saving profile:', error);
            setSaveMessage('Error saving profile');
            setLoading(false);

            setTimeout(() => {
                setSaveMessage(null);
            }, 5000);

            // Handle error, show a message, etc.
        }
    };

    const handleSaveAttributeClick = async () => {
        setLoading(true);

        try {
            // Send the form data to the backend API endpoint
            const updatedOrgName = isEditingOrgName ? orgNameInput.trim() : formData.orgName.trim();
            const updatedMatchingMethod = isEditingMatchingMethod ? matchingMethodInput.trim() : formData.matchingMethod.trim();
            const updatedBlindMatching = isEditingBlindMatching ? blindMatchingInput.trim() : formData.blindMatching.trim();


            const response = await axios.post('http://localhost:3001/managerProfile', {
                ...formData,
                email: user.email,
                userType: user.userType,
                orgName: updatedOrgName,
                matchingMethod: updatedMatchingMethod,
                blindMatching: updatedBlindMatching,

            });

            // Update formData with the response from the server
            setFormData((prevData) => ({
                ...prevData,
                orgName: response.data.orgName || updatedOrgName,
                matchingMethod: response.data.matchingMethod || updatedMatchingMethod,
                blindMatching: response.data.blindMatching || updatedBlindMatching,
            }));

            setIsEditingOrgName(false);
            setIsEditingMatchingMethod(false);
            setIsEditingBlindMatching(false);

            setLoading(false);

            setSaveMessage('Profile saved successfully');

            setTimeout(() => {
                setSaveMessage(null);
            }, 5000);


            console.log('Profile saved successfully:', response.data);
        } catch (error) {
            console.error('Error saving profile:', error);
            setSaveMessage('Error saving profile');
            setLoading(false);

            setTimeout(() => {
                setSaveMessage(null);
            }, 5000);

            // Handle error, show a message, etc.
        }
    };


    return (
        <>
            <div className='profile-page'>
                <Header />

                {saveMessage && (
                    <div className={`save-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`}>
                        <p>{saveMessage}</p>
                    </div>
                )}
                <div className='error-message-profile-container'>
                    {errorMessage && <p className="error-message-profile">{errorMessage}</p>}
                </div>

                <div className='header-settings'>
                    <div className="text-center">
                        <h2 className="profile-heading">Profile Settings</h2>
                        <div className='account-background'>
                            <p className="account-type">Account Type: {user.userType && user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} </p>
                        </div>
                    </div>


                </div>

                <div className="profile-container">

                    <div className="profile-settings-box">

                        <div className='editable-container'>

                            <p className="editable-attribute">
                                <span className="attribute-label">Organisation Name:</span>
                                {isEditingOrgName ? (
                                    <>
                                        <input
                                            className='job-role-field'
                                            type="text"
                                            value={isEditingOrgName ? orgNameInput : formData.orgName}
                                            onChange={(e) => setOrgNameInput(e.target.value)}
                                        />

                                        <img className='save-button'  src={tick} alt="Save" onClick={handleSaveAttributeClick} />
                                        <img className="cancel-button" src={cross} alt="Cancel" onClick={() => setIsEditingOrgName(false)} />   
                                    </>
                                ) : (
                                    <>
                                        <span className='job-role'>{formData.orgName}</span>
                                        <span className='edit-icon-container' onClick={() => handleEditClick('OrgName')}>
                                            <img src={editIcon} alt="Edit" className="edit-icon" />
                                        </span>
                                    </>
                                )}
                            </p>

                            <Tooltip text="The name of your Company/Business">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                            </Tooltip>

                        </div>
                        <div className='editable-container'>

                            <p className='dropdown-title'>
                                Matching Method:

                                <Select
                                    isMulti={false}
                                    options={matchingMethodOptions}
                                    placeholder="Select Matching Method"
                                    styles={customStyles}
                                    value={matchingMethodOptions.find(option => option.value === formData.matchingMethod) || null}
                                    onChange={(selectedOption) =>
                                        handleInputChange('matchingMethod', selectedOption.value)
                                    }
                                />
                            </p>
                            <Tooltip text="Your preferred method for matches to be made">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                            </Tooltip>
                        </div>
                        <div className='editable-container'>

                            <p className='dropdown-title'>
                                Blind Matching:
                                <Select
                                    isMulti={false}
                                    placeholder="Select Preference"
                                    options={blindMatchingOptions}
                                    styles={customStyles}
                                    value={blindMatchingOptions.find(option => option.value === formData.blindMatching) || null}
                                    onChange={(selectedOption) =>
                                        handleInputChange('blindMatching', selectedOption.value)
                                    }
                                />
                            </p>
                            <Tooltip text="Blind Matching withholds users' names in matching to prevent bias">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                            </Tooltip>
                        </div>

                    </div>
                </div>
                {loading ? (
                    <div className='loader-container'>

                        <Loader />
                    </div>
                ) : (
                    <div className='save-info'>
                        <button onClick={handleSaveClick}>Save</button>
                    </div>

                )}

            </div>

            <Footer />
        </>
    );
};


export default AdminSettings;
