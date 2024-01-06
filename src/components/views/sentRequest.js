import React from 'react';
import profile from '../images/profile-black.png';
import cross from '../images/cross-icon.png';
import axios from 'axios';
import Loader from '../utils/loader';
import { useState } from 'react';
import '../styles/SentRequests.css';

const SentRequest = ({ request, onRemoveRequest }) => {

    const email = sessionStorage.getItem('email');
    const [loading, setLoading] = useState(false);

    const handleCancelClick = async () => {
        setLoading(true);
        try {
            // Make API call to delete the email from sentRequests
            await axios.delete(`http://localhost:3001/cancelRequest/${request.email}`, {
                data: { email: email }
            });
            // Update the UI by removing the request from the list
            onRemoveRequest(request.email);
            setLoading(false);

        } catch (error) {
            setLoading(false);
            console.error('Error deleting request:', error);
            // Handle error if the API call fails
        }
    };



    return (
    <>
        {
            loading?(
                        <Loader />
                    ) : (
        <div className="request-box-sent">
            <div className='icon-box'>
                <img className='request-profile-icon' src={profile} alt="Profile Icon" />
                <a href="#profile-link" className='view-profile'>View Profile</a>
            </div>
            <div className="sent-profile-info">
                <p className='sent-name'>{`${request.firstName} ${request.lastName}`}</p>
            </div>
            <div className='action-buttons'>
                <img src={cross} alt="Cancel" className="action-icon" onClick={handleCancelClick} />
            </div>
        </div>
    )
            }</>);
};

export default SentRequest;
