import React from 'react';
import Header from './header';
import Footer from './footer';
import editIcon from '../images/EditIcon.png';
import Select from 'react-select';


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

const AdminSettings = () => {
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
                        <p className="account-type">Account Type: Manager</p>
                    </div>
                </div>

                <div className="profile-container">
                    {/* Left Box */}
                    <div className="profile-box">
                        <p className="editable-attribute">
                            Organisation Domain:
                            <span onClick={() => handleEditClick('Job Role')}>
                                <img src={editIcon} alt="Edit" className="edit-icon" />
                            </span>
                        </p>
                        {/* Add input fields for editable attributes */}
                        <p className="editable-attribute">
                            Department:
                            <span onClick={() => handleEditClick('Job Role')}>
                                <img src={editIcon} alt="Edit" className="edit-icon" />
                            </span>
                        </p>
                        {/* Add input fields for editable attributes */}
                          <p className="editable-attribute">
                                Office Location:
                                <span onClick={() => handleEditClick('Job Role')}>
                                    <img src={editIcon} alt="Edit" className="edit-icon" />
                                </span>
                        </p>
                    </div>

                    {/* Right Box */}
                    <div className="profile-box">
                        <p className='dropdown-title'>
                            Method of Pairing:
                            <Select
                                isMulti={false}
                                options={pairingOptions}
                                placeholder="Select Method"
                                styles={customStyles}
                            />
                        </p>
                        <p className='dropdown-title'>
                            Blind Matching:
                            <Select
                                isMulti={false}
                                placeholder="Select Preference"
                                options={blindOptions}
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

export default AdminSettings;
