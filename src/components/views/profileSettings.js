import React from 'react';
import Header from './header';
import Footer from './footer';
import editIcon from '../images/EditIcon.png';
import Select from 'react-select';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../styles/Profile.css';

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

const developmentOptions = [
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

const departmentOptions = [
    { value: 'department', label: 'Department' },
]

const locationOptions = [
    { value: 'location', label: 'Location' },
]


const customStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: 'white', // Change the background color of the control
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

const Profile = () => {

    const location = useLocation(); 
    const user = location.state?.user || { userType: '', email: '' };
    const { userType, email } = user;

    console.log(user, 'user')

    console.log(email,'email')
    
    const [formData, setFormData] = useState({
        jobRole: '',
        department: '',
        officeLocation: '',
        languages: [],
        developmentAreas: [],
        mentoringMethods: [],
    });

    const [isEditingJobRole, setIsEditingJobRole] = useState(false);
    const [jobRoleInput, setJobRoleInput] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.post('http://localhost:3001/getProfile', 
                    { email: user.email, userType: user.userType }, // Use the params option to send email as a parameter
                );
                setFormData(response.data || {});
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, [user.email,user.userType]);

    const handleInputChange = (field, value) => {
        setFormData((prevData) => ({ ...prevData, [field]: value }));
    };

    const handleEditClick = (attribute) => {
        if (attribute === 'Job Role') {
            setIsEditingJobRole(true);
        }
    };


    const handleSaveClick = async () => {
        try {
            // Send the form data to the backend API endpoint
            const response = await axios.post('http://localhost:3001/profile', {
                ...formData,
                email: user.email,
                userType: user.userType,
            });
            setIsEditingJobRole(false);
            console.log('Profile saved successfully:', response.data);
            // You can add a success message or redirect the user after successful save
        } catch (error) {
            console.error('Error saving profile:', error);
            // Handle error, show a message, etc.
        }
    };

    return (
        <>
        <div className='profile-page'>
            <Header loggedIn={true}/>

            <div className="text-center">
                <h2 className="profile-heading">Profile Settings</h2>
                <div className='account-background'>
                        <p className="account-type">Account Type: {userType && userType.charAt(0).toUpperCase() + userType.slice(1)} </p>
                </div>
            </div>

            <div className="profile-container">
                {/* Left Box */}
                <div className="profile-box">
                    
                    {/* Add input fields for editable attributes */}
                        <p className="editable-attribute">
                            Job Role:
                            {isEditingJobRole ? (
                                <>
                                    <input
                                        className='job-role-field'
                                        type="text"
                                        value={jobRoleInput}
                                        onChange={(e) => setJobRoleInput(e.target.value)}
                                    />
                                    <button className='save-button' onClick={handleSaveClick}>Save</button>
                                </>
                            ) : (
                                <span onClick={() => handleEditClick('Job Role')}>
                                    <img src={editIcon} alt="Edit" className="edit-icon" />
                                </span>
                            )}
                        </p>
                    <p className="dropdown-title">
                            Office Location:
                            <Select
                                isMulti={false}
                                options={locationOptions}
                                placeholder="Select Office"
                                styles={customStyles}
                                onChange={(selectedOption) =>
                                    handleInputChange('officeLocation', selectedOption.value)
                                }

                            />
                    </p>
                </div>

                {/* Right Box */}
                <div className="profile-box">
                    <p className='dropdown-title'>
                        Language(s):
                            <Select
                                isMulti= {true}
                                options={languageOptions}
                                placeholder="Select Languages"
                                styles={customStyles}
                                onChange={(selectedOption) =>
                                    handleInputChange('languages', selectedOption.value)
                                }
                            />
                    </p>
                    <p className='dropdown-title'>
                        Areas of Development:
                            <Select
                                isMulti={true}
                                placeholder="Select Development Areas"
                                options={developmentOptions}
                                styles={customStyles}
                                onChange={(selectedOption) =>
                                    handleInputChange('developmentAreas', selectedOption.value)
                                }
                            />
                    </p>
                        <p className='dropdown-title'>
                        Methods of Mentoring:
                            <Select
                                isMulti={true}
                                placeholder="Select Mentoring Methods"
                                options={methodOptions}
                                styles={customStyles}
                                onChange={(selectedOption) =>
                                    handleInputChange('mentoringMethods', selectedOption.value)
                                }
                            />
                    </p>
                </div>
                </div>
                <div className='save-info'>
                    <button onClick={handleSaveClick}>Save</button>
                </div>
            </div>

                    <Footer />
</>
    );
};

export default Profile;
