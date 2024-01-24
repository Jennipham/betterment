import React from 'react';
import { useState } from 'react';
import Modal from '../utils/modal';
import axios from 'axios';
import profile from '../images/profile-black.png';
import cross from '../images/cross-icon.png';
import tick from '../images/tick-icon.png';
import '../styles/ReceivedRequests.css';

const ReceivedRequest = ({ request, onDecline, onAccept }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const userType = sessionStorage.getItem('userType');


    const openModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleDecline = async () => {
        try {
            // Make API call to decline the request
            await axios.post('http://localhost:3001/declineRequest', {
                email: sessionStorage.getItem('email'),
                senderEmail: request.senderEmail,
                userType: userType,
            });

            // Trigger the decline callback with the request data
            onDecline(request);
        } catch (error) {
            console.error('Error declining request:', error);
            // Handle error if the API call fails
        }
    };

    const handleAccept = async () => {
        try {
            await axios.post('http://localhost:3001/acceptRequest', {
                email: sessionStorage.getItem('email'),
                senderEmail: request.senderEmail,
                userType: userType,
            });

            onAccept(request);
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    return (
        <div className="request-box-received">
            <div className='icon-box'>
                <button className="match-profile-button" onClick={() => openModal(request)}>
                    <img className='request-profile-icon' src={profile} alt="Profile Icon" />
                </button>
                <button className="view-profile" onClick={() => openModal(request)}>View Full Profile</button>
                {isModalOpen && (
                    <Modal onClose={handleCloseModal}>
                        <iframe title="Full Profile" src="/fullprofile" width="100%" height="100%" />
                    </Modal>
                )}
            </div>
            <div className="received-profile-info">
                <p className='received-name'>{`${request.firstName} ${request.lastName}`}</p>
            </div>
            <div className='action-buttons'>
                <img src={cross} alt="Reject" className="action-icon" onClick={handleDecline} />
                <img src={tick} alt="Accept" className="action-icon" onClick={handleAccept} />
            </div>
        </div>
    );
};

export default ReceivedRequest;
