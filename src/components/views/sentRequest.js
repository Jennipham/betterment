import React from 'react';
import profile from '../images/profile-black.png';
import cross from '../images/cross-icon.png';
import '../styles/SentRequests.css';

const SentRequest = ({ request }) => {
    return (
        <div className="request-box-sent">
            <img className='request-profile-icon' src={profile} alt="Profile Icon" />
            <div className="sent-profile-info">
                <h3>{request.username}</h3>
                <p>View Profile</p>
            </div>
            <img src={cross} alt="Cancel" className="action-icon" />
        </div>
    );
};

export default SentRequest;
