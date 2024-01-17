import React from 'react';
import profile from '../images/profile-black.png';
import cross from '../images/cross-icon.png';
import axios from 'axios';
import Loader from '../utils/loader';
import Modal from '../utils/modal';
import { useState } from 'react';
import '../styles/SentRequests.css';

const SentRequest = ({ request, onRemoveRequest }) => {

    console.log('sent', request);

    const email = sessionStorage.getItem('email');
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (request) => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleCancelClick = async () => {
        setLoading(true);
        try {
            // Make API call to delete the email from sentRequests
            await axios.delete(`http://localhost:3001/cancelRequest/${request.receiverEmail}`, {
                data: { email: email }
            });
            // Update the UI by removing the request from the list
            onRemoveRequest(request.receiverEmail);  // Pass the correct email here
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error deleting request:', error);
            // Handle error if the API call fails
        }
    };

    const expirationDate = new Date(request.expiration);
    const currentDate = new Date();
    const isExpired = currentDate > expirationDate;

    return (
    <>
        {
            loading?(
                        <Loader />
                    ) : (
                        <div className={`request-box-sent ${isExpired ? 'expired-request' : ''}`}>
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
