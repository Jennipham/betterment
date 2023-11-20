import React from 'react';
import Header from './header';
import Footer from './footer';
import editIcon from '../images/EditIcon.png';
import Select from 'react-select';


import '../styles/Profile.css';

const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    // Add more options as needed
];

const developmentOptions = [
    { value: 'communication', label: 'Communication' },
    { value: 'timeManagement', label: 'Time Management' },
]

const methodOptions = [
    { value: 'inPerson', label: 'In Person Sessions' },
    { value: 'virtual', label: 'Virtual Sessions' },
]

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
                            />
                    </p>
                    <p className='dropdown-title'>
                        Topics of Development:
                            <Select
                                isMulti={true}
                                options={developmentOptions}
                            />
                    </p>
                        <p className='dropdown-title'>
                        Methods of Mentoring:
                            <Select
                                isMulti={true}
                                options={methodOptions}
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
