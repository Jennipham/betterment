import React from 'react';
import Header from '../utils/header';
import Footer from '../utils/footer';
import editIcon from '../images/EditIcon.png';
import Select from 'react-select';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

import '../styles/AdminSettings.css';

const pairingOptions = [
    { value: 'default', label: 'BetterMent Algorithm' },
    { value: 'manual', label: 'Manual User Pairing' },
    { value: 'manager', label: 'Assigned by Manager' },

];

const blindOptions = [
    { value: 'on', label: 'On' },
    { value: 'off', label: 'Off' },
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

const capitaliseFirstLetter = (str) => {
    if (str === null || str === undefined) {
        return;
    }
    return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const AdminSettings = () => {

    const location = useLocation();
    const user = location.state?.user || { userType: '', email: '' };
    const { userType, email } = user;

    const [formData, setFormData] = useState({
        domain: '',
        department: '',
        officeLocation: '',
        mentoringMethods: [],
        blindMatching: '',
    });

    const [isEditingDomain, setIsEditingDomain] = useState(false);
    const [domainInput, setDomainInput] = useState('');

    const [isEditingDepartment, setIsEditingDepartment] = useState(false);
    const [departmentInput, setDepartmentInput] = useState('');

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
                    mentoringMethods: response.data.profile.profileInfo.mentoringMethods || [], // Ensure 'languages' is an array
                    
                }));
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
        if (attribute === 'Organisation Domain') {
            setIsEditingDomain(true);
        }

        if (attribute === 'Department') {
            setIsEditingDepartment(true);
        }
    };

    const handleSaveClick = async () => {
        try {
            // Send the form data to the backend API endpoint
            const updatedDomain = isEditingDomain ? domainInput.trim() : formData.domain.trim();
            const updatedDepartment = isEditingDepartment ? departmentInput.trim() : formData.department.trim();

            const response = await axios.post('http://localhost:3001/managerProfile', {
                ...formData,
                email: user.email,
                userType: user.userType,
                domain: updatedDomain,
                department: updatedDepartment,
            });

            // Update formData with the response from the server
            setFormData((prevData) => ({
                ...prevData,
                domain: response.data.domain || updatedDomain,
                department: response.data.department || updatedDepartment,

            }));

            setIsEditingDomain(false);
            setIsEditingDepartment(false);


            console.log('Profile saved successfully:', response.data);
        } catch (error) {
            console.error('Error saving profile:', error);
            // Handle error, show a message, etc.
        }
    };

    return (
        <>
            <div className='profile-page'>
                <Header  />

                <div className="text-center">
                    <h2 className="profile-heading">Profile Settings</h2>
                    <div className='account-background'>
                        <p className="account-type">Account Type: Manager</p>
                    </div>
                </div>

                <div className="profile-container">
                    {/* Left Box */}
                    <div className="profile-box">

                        <p className="editable-attribute">
                            <span className="attribute-label">Organisation Domain:</span>
                            {isEditingDomain ? (
                                <>
                                    <input
                                        className='domain-field'
                                        type="text"
                                        value={isEditingDomain ? domainInput : formData.domain}
                                        onChange={(e) => setDomainInput(e.target.value)}
                                    />
                                    <button className='save-button' onClick={handleSaveClick}>Save</button>
                                    <button className='cancel-button' onClick={() => setIsEditingDomain(false)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span className='job-role'>{formData.domain}</span>
                                    <span className='edit-icon-container' onClick={() => handleEditClick('Organisation Domain')}>
                                        <img src={editIcon} alt="Edit" className="edit-icon" />
                                    </span>
                                </>
                            )}
                        </p>

                        {/* Add input fields for editable attributes */}
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
                    </div>

                    {/* Right Box */}
                    <div className="profile-box">
                        <p className='dropdown-title'>
                            Method of Pairing:
                            <Select
                                isMulti={true}
                                options={pairingOptions}
                                placeholder="Select Method"
                                styles={customStyles}
                                value={
                                    formData.mentoringMethods
                                        ? formData.mentoringMethods.map((pairing) => ({
                                            value: pairing,
                                            label: capitaliseFirstLetter(pairing),
                                        }))
                                        : null
                                }
                                onChange={(selectedOptions) =>
                                    handleMultiInputChange('mentoringMethods', selectedOptions.map(option => option.value))
                                }
                            />
                        </p>
                        <p className='dropdown-title'>
                            Blind Matching:
                            <Select
                                isMulti={false}
                                placeholder="Select Preference"
                                options={blindOptions}
                                styles={customStyles}
                                value={formData.blindMatching ? { value: formData.blindMatching, label: capitaliseFirstLetter(formData.blindMatching) } : null}
                                onChange={(selectedOption) =>
                                    handleInputChange('blindMatching', selectedOption.value)
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

export default AdminSettings;
