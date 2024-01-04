import React from 'react';
import profile from '../images/profile-black.png';
import cross from '../images/cross-icon.png';
import '../styles/SentRequests.css';

const SentRequest = ({ request }) => {
    return (
        <div className="request-box-sent">
            <div className='icon-box'>
                <img className='request-profile-icon' src={profile} alt="Profile Icon" />
                <a href="#profile-link" className='view-profile'>View Profile</a>
            </div>
            <div className="sent-profile-info">
                <h3>{request.username}</h3>
            </div>
            <div className='action-buttons'>
                <img src={cross} alt="Cancel" className="action-icon" />
            </div>
        </div>
    );
};

export default SentRequest;
