import React from 'react';
import profile from '../images/profile-black.png';
import cross from '../images/cross-icon.png';
import tick from '../images/tick-icon.png';
import '../styles/ReceivedRequests.css';

const ReceivedRequest = ({ request }) => {
    return (
        <div className="request-box-received">
            <img className='request-profile-icon' src={profile} alt="Profile Icon" />
            <div className="received-profile-info">
                <h3>{request.username}</h3>
                <p>View Profile</p>
            </div>
            <img src={cross} alt="Reject" className="action-icon" />
            <img src={tick} alt="Accept" className="action-icon" />
        </div>
    );
};

export default ReceivedRequest;
