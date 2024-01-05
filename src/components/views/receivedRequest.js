import React from 'react';
import profile from '../images/profile-black.png';
import cross from '../images/cross-icon.png';
import tick from '../images/tick-icon.png';
import '../styles/ReceivedRequests.css';

const ReceivedRequest = ({ request }) => {
    return (
        <div className="request-box-received">
            <div className='icon-box'>
                <img className='request-profile-icon' src={profile} alt="Profile Icon" />
                <a href="#profile-link" className='view-profile'>View Profile</a>
            </div>
            <div className="received-profile-info">
                <p className='received-name'>{`${request.firstName} ${request.lastName}`}</p>
            </div>
            <div className='action-buttons'>
                <img src={cross} alt="Reject" className="action-icon" />
                <img src={tick} alt="Accept" className="action-icon" />
            </div>
        </div>
    );
};

export default ReceivedRequest;
