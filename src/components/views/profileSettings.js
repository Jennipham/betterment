import React from 'react';
import Header from './header';
import Footer from './footer';
import editIcon from '../images/EditIcon.png';

import '../styles/Profile.css';

const Profile = () => {
    const handleEditClick = (attribute) => {
        // Add your logic to handle the edit click for the specific attribute
        console.log(`Edit icon clicked for ${attribute}`);
    };

    return (
        <div className='profile-page'>
            <Header />

            <div className="text-center">
                <h2 className="profile-heading">Profile Settings</h2>
                <p className="account-type">Account Type:</p>
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
                    <p>
                        Language(s):
                        {/* Add dropdown for selecting language(s) */}
                        <select className="dropdown">
                            <option>English</option>
                            <option>Spanish</option>
                            {/* Add more options as needed */}
                        </select>
                    </p>
                    <p>
                        Topics of Development:
                        {/* Add dropdown for selecting topics of development */}
                        <select className="dropdown">
                            <option>Software Development</option>
                            <option>Design</option>
                            {/* Add more options as needed */}
                        </select>
                    </p>
                    <p>
                        Methods of Mentoring:
                        {/* Add dropdown for selecting methods of mentoring */}
                        <select className="dropdown">
                            <option>Pair Programming</option>
                            <option>Mentorship Sessions</option>
                            {/* Add more options as needed */}
                        </select>
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
