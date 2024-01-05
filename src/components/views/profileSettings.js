import React from 'react';
import Header from '../utils/header';
import Footer from '../utils/footer';
import Loader from '../utils/loader';
import editIcon from '../images/EditIcon.png';
import notification from '../images/notification-icon.png';
import moreInfo from '../images/more-info-icon.png';
import Tooltip from '../utils/tooltip';
import Select from 'react-select';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ProfileSettings.css';

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

const locationOptions = [
    { value: 'location', label: 'Location' },
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

const capitaliseFirstLetter = (str) => {
    if (str === undefined) {
        return;
    }
    return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const Profile = () => {

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
        const officeLocation = sessionStorage.getItem('officeLocation') || '';
        const developmentAreas = sessionStorage.getItem('developmentAreas') || '';
        const mentoringMethods = sessionStorage.getItem('mentoringMethods') || '';
        const languages = sessionStorage.getItem('languages') || '';



        setUser({ firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
        console.log('User Information:', { firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
    }, []);

    
    const [formData, setFormData] = useState({
        jobRole: '',
        department: '',
        officeLocation: '',
        capacity: '',
        languages: [],
        developmentAreas: [],
        mentoringMethods: [],
    });

    const [isEditingJobRole, setIsEditingJobRole] = useState(false);
    const [jobRoleInput, setJobRoleInput] = useState('');

    const [isEditingDepartment, setIsEditingDepartment] = useState(false);
    const [departmentInput, setDepartmentInput] = useState('');

    const [isEditingCapacity, setIsEditingCapacity] = useState(false);
    const [capacityInput, setCapacityInput] = useState('');

    const [saveMessage, setSaveMessage] = useState(null);
    const [loading, setLoading] = useState(false);



    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.post('http://localhost:3001/getProfile', {
                    email: user.email,
                    userType: user.userType,
                });

                setFormData((prevData) => ({
                    ...prevData,
                    ...response.data.profile.profileInfo,
                    languages: response.data.profile.profileInfo.languages || [], // Ensure 'languages' is an array
                    developmentAreas: response.data.profile.profileInfo.developmentAreas || [], // Ensure 'developmentAreas' is an array
                    mentoringMethods: response.data.profile.profileInfo.mentoringMethods || [], // Ensure 'mentoringMethods' is an array


                }));
                sessionStorage.setItem('profile', JSON.stringify(response.data.profile.profileInfo));

            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, [user.email, user.userType]);


    const handleInputChange = (field, value) => {
        setFormData((prevData) => ({ ...prevData, [field]: value }));
    };

    const handleMultiInputChange = (field, selectedOptions) => {
        const capitalizedOptions = selectedOptions.map(option => option.charAt(0).toUpperCase() + option.slice(1));
        setFormData((prevData) => ({ ...prevData, [field]: capitalizedOptions }));
    };


    const handleEditClick = (attribute) => {
        if (attribute === 'Job Role') {
            setIsEditingJobRole(true);
        }

        if (attribute === 'Department') {
            setIsEditingDepartment(true);
        }

        if (attribute === 'Capacity') {
            setIsEditingCapacity(true);
        }
    };



    const handleSaveClick = async () => {
        setLoading(true);

        try {
            // Send the form data to the backend API endpoint
            const updatedJobRole = isEditingJobRole ? jobRoleInput.trim() : formData.jobRole.trim();
            const updatedDepartment = isEditingDepartment ? departmentInput.trim() : formData.department.trim();
            const updatedCapacity = isEditingCapacity ? capacityInput.trim() : formData.capacity.trim();

            const response = await axios.post('http://localhost:3001/profile', {
                ...formData,
                email: user.email,
                userType: user.userType,
                jobRole: updatedJobRole,
                department: updatedDepartment,
                capacity: updatedCapacity,

            });

            // Update formData with the response from the server
            setFormData((prevData) => ({
                ...prevData,
                jobRole: response.data.jobRole || updatedJobRole,
                department: response.data.department || updatedDepartment,
                capacity: response.data.capacity || updatedCapacity,

            }));

            setIsEditingJobRole(false);
            setIsEditingDepartment(false);
            setIsEditingCapacity(false);
            setLoading(false);

            setSaveMessage('Profile saved successfully');

            setTimeout(() => {
                setSaveMessage(null);
            }, 5000);


            console.log('Profile saved successfully:', response.data);
            // You can add a success message or redirect the user after a successful save
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
                <Header loggedIn={true} />
                
                {saveMessage && (
                    <div className={`save-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`}>
                        <p>{saveMessage}</p>
                    </div>
                )}

                <div className='header-settings'>
                    <div className="text-center">
                        <h2 className="profile-heading">Profile Settings</h2>
                        <div className='account-background'>
                            <p className="account-type">Account Type: {user.userType && user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} </p>
                        </div>
                    </div>

                    <div className="notification-container">
                        <a href="/requests">
                            <img src={notification} alt="Notification" className="notification-icon" />
                            <p className="notification-caption">Requests (0)</p>
                        </a>
                    </div>
                </div>

                <div className="profile-container">
                 
                    <div className="profile-settings-box">
                        
                        <div className='editable-container'>

                        <p className="editable-attribute">
                            <span className="attribute-label">Job Role:</span>
                            {isEditingJobRole ? (
                                <>
                                    <input
                                        className='job-role-field'
                                        type="text"
                                        value={isEditingJobRole ? jobRoleInput : formData.jobRole}
                                        onChange={(e) => setJobRoleInput(e.target.value)}
                                    />
                                    <button className='save-button' onClick={handleSaveClick}>Save</button>
                                    <button className='cancel-button' onClick={() => setIsEditingJobRole(false)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span className='job-role'>{formData.jobRole}</span>
                                    <span className='edit-icon-container' onClick={() => handleEditClick('Job Role')}>
                                        <img src={editIcon} alt="Edit" className="edit-icon" />
                                    </span>
                                </>
                            )}
                            </p>
                             
                            <Tooltip text="Your Occupation">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                                </Tooltip>
  
                        </div>
                        <div className='editable-container'>
                        <p className="editable-attribute">
                            <span className="attribute-label">Department:</span>
                            {isEditingDepartment ? (
                                <>
                                    <input
                                        className='job-role-field'
                                        type="text"
                                        value={isEditingDepartment ? departmentInput : formData.department}
                                        onChange={(e) => setDepartmentInput(e.target.value)}
                                    />
                                    <button className='save-button' onClick={handleSaveClick}>Save</button>
                                    <button className='cancel-button' onClick={() => setIsEditingDepartment(false)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span className='job-role'>{formData.department}</span>
                                    <span className='edit-icon-container' onClick={() => handleEditClick('Department')}>
                                        <img src={editIcon} alt="Edit" className="edit-icon" />
                                    </span>
                                </>
                            )}
                            </p>
                            <Tooltip text="The Department you work in.">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                            </Tooltip>

                            </div>

                        <div className='editable-container'>

                    <p className="dropdown-title">
                            Office Location:
                            <Select
                                isMulti={false}
                                options={locationOptions}
                                placeholder="Select Office"
                                styles={customStyles}
                                value={formData.officeLocation ? { value: formData.officeLocation, label: capitaliseFirstLetter(formData.officeLocation) } : null}
                                onChange={(selectedOption) =>
                                    handleInputChange('officeLocation', selectedOption.value)
                                }

                            />
                            </p>
                            <Tooltip text="The location of your workplace.">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                            </Tooltip>
                            </div>

                        
                        <div className='editable-container'>
                        <p className="editable-attribute">
                            <span className="attribute-label">Capacity:</span>
                            {isEditingCapacity ? (
                                <>
                                    <input
                                        className='job-role-field'
                                        type="text"
                                        value={isEditingCapacity ? capacityInput : formData.capacity}
                                        onChange={(e) => setCapacityInput(e.target.value)}
                                    />
                                    <button className='save-button' onClick={handleSaveClick}>Save</button>
                                    <button className='cancel-button' onClick={() => setIsEditingCapacity(false)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span className='job-role'>{formData.capacity}</span>
                                    <span className='edit-icon-container' onClick={() => handleEditClick('Capacity')}>
                                        <img src={editIcon} alt="Edit" className="edit-icon" />
                                    </span>
                                </>
                            )}
                            </p>
                            <Tooltip text="The number of mentors/mentees you are willing to be matched with.">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                            </Tooltip>
                        </div>
                </div>

                {/* Right Box */}
                    <div className="profile-settings-box">
                        <div className='editable-container'>

                    <p className='dropdown-title'>
                        Language(s):
                            <Select
                                isMulti= {true}
                                options={languageOptions}
                                placeholder="Select Languages"
                                styles={customStyles}
                                value={
                                    formData.languages
                                        ? formData.languages.map((lang) => ({
                                            value: lang,
                                            label: capitaliseFirstLetter(lang),
                                        }))
                                        : null
                                }
                                onChange={(selectedOptions) =>
                                    handleMultiInputChange('languages', selectedOptions.map(option => option.value))
                                }
                            />
                            </p>
                            <Tooltip text="Languages you speak.">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                            </Tooltip>
                        </div>
                        <div className='editable-container'>

                    <p className='dropdown-title'>
                        Areas of Development:
                            <Select
                                isMulti={true}
                                placeholder="Select Development Areas"
                                options={developmentAreaOptions}
                                styles={customStyles}
                                value={
                                    formData.developmentAreas
                                        ? formData.developmentAreas.map((area) => ({
                                            value: area,
                                            label: capitaliseFirstLetter(area),
                                        }))
                                        : null
                                }
                                onChange={(selectedOptions) =>
                                    handleMultiInputChange('developmentAreas', selectedOptions.map(option => option.value))
                                }
                            />
                            </p>
                            <Tooltip text="The areas you want to focus on for mentoring.">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                            </Tooltip>
                        </div>
                        <div className='editable-container'>

                        <p className='dropdown-title'>
                        Methods of Mentoring:
                            <Select
                                isMulti={true}
                                placeholder="Select Mentoring Methods"
                                options={methodOptions}
                                styles={customStyles}
                                value={
                                    formData.mentoringMethods
                                        ? formData.mentoringMethods.map((methods) => ({
                                            value: methods,
                                            label: capitaliseFirstLetter(methods),
                                        }))
                                        : null
                                }
                                onChange={(selectedOptions) =>
                                    handleMultiInputChange('mentoringMethods',selectedOptions.map(option => option.value))
                                }
                            />
                            </p>
                            <Tooltip className="tooltip-text" text="The methods you're happy to receive/give mentoring.">
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

export default Profile;
