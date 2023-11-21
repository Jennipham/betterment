import React from 'react';
import Header from './header';
import Footer from './footer';
import editIcon from '../images/EditIcon.png';
import Select from 'react-select';


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
    const handleEditClick = (attribute) => {
        // Add your logic to handle the edit click for the specific attribute
        console.log(`Edit icon clicked for ${attribute}`);
    };

    return (
        <>
        <div className='profile-page'>
            <Header />

            <div className="text-center">
                <h2 className="profile-heading">Profile Settings</h2>
                <div className='account-background'>
                    <p className="account-type">Account Type:</p>
                </div>
            </div>

            <div className="profile-container">
                {/* Left Box */}
                <div className="profile-box">
                    <p className="editable-attribute">
                        Job Role:
                        <span onClick={() => handleEditClick('Job Role')}>
                            <img src={editIcon} alt="Edit" className="edit-icon" />
                        </span>
                    </p>
                    {/* Add input fields for editable attributes */}
                    <p className="editable-attribute">
                        Department:
                        <span onClick={() => handleEditClick('Department')}>
                            <img src={editIcon} alt="Edit" className="edit-icon" />
                        </span>
                    </p>
                    {/* Add input fields for editable attributes */}
                    <p className="editable-attribute">
                        Office Location:
                        <span onClick={() => handleEditClick('Office Location')}>
                            <img src={editIcon} alt="Edit" className="edit-icon" />
                        </span>
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
                            />
                    </p>
                    <p className='dropdown-title'>
                        Areas of Development:
                            <Select
                                isMulti={true}
                                placeholder="Select Development Areas"
                                options={developmentOptions}
                                styles={customStyles}
                            />
                    </p>
                        <p className='dropdown-title'>
                        Methods of Mentoring:
                            <Select
                                isMulti={true}
                                placeholder="Select Mentoring Methods"
                                options={methodOptions}
                                styles={customStyles}
                            />
                    </p>
                </div>
            </div>
        </div>
                    <Footer />
</>
    );
};

export default Profile;
