import React from 'react';
import { useState } from 'react';
import Modal from '../utils/modal';
import profile from '../images/profile-black.png';
import cross from '../images/cross-icon.png';
import tick from '../images/tick-icon.png';
import '../styles/ReceivedRequests.css';

const ReceivedRequest = ({ request }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
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
                <img src={cross} alt="Reject" className="action-icon" />
                <img src={tick} alt="Accept" className="action-icon" />
            </div>
        </div>
    );
};

export default ReceivedRequest;
