import React from 'react';
import { useState, useEffect } from 'react';
import FullProfile from './fullViewProfile';
import Modal from '../utils/modal';
import axios from 'axios';
import profile from '../images/profile-black.png';
import cross from '../images/cross-icon.png';
import tick from '../images/tick-icon.png';
import accepted from '../images/accepted-icon.png';
import received from '../images/received-icon.png';
import '../styles/ReceivedRequests.css';

const ReceivedRequest = ({ request, onDecline }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const userType = sessionStorage.getItem('userType');

    const [matchProfile, setMatchProfile] = useState([]);
    const [matchFname, setMatchFname] = useState('');
    const [matchSname, setMatchSname] = useState('');
    const [matchUserType, setMatchUserType] = useState('');



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

        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    useEffect(() => {
        const fetchMatchProfile = async () => {
            try {
                // Fetch user details
                const userDetailsResponse = await axios.get(`http://localhost:3001/getUserDetails?email=${request.senderEmail}`);
                const userDetails = userDetailsResponse.data.user;

                // Set user details
                setMatchFname(userDetails.fname);
                setMatchSname(userDetails.sname);
                setMatchUserType(userDetails.userType);

                // Fetch user profile
                const userResponse = await axios.post('http://localhost:3001/getProfile', {
                    email: request.senderEmail,
                    userType: userDetails.userType,
                });
                setMatchProfile(userResponse.data.profile);

            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response && error.response.status === 404) {
                    // Handle 404 error if needed
                } else {
                    // Handle other errors
                }
            }
        };

        // Call the fetchMatchProfile function
        fetchMatchProfile();
    }, [request.senderEmail]); // Add dependencies to the dependency array


    return (
        <div className='received-container'>
            <div className="request-box-received">
                <div className='icon-box'>
                    <button className="match-profile-button" onClick={() => openModal()}>
                        <img className='request-profile-icon' src={profile} alt="Profile Icon" />
                    </button>
                    <button className="view-profile" onClick={() => openModal()}>View Full Profile</button>
                    {isModalOpen && (
                        <Modal onClose={handleCloseModal}>
                            <iframe title="Full Profile" src={`/fullprofile/${request.senderEmail}`} width="100%" height="100%">
                            </iframe>
                        </Modal>
                    )}
                </div>
                <div className="received-profile-info">
                    <p className='received-name'>{`${matchFname} ${matchSname}`}</p>
                </div>
                <div className='action-buttons'>
                {!request.accepted ? (
                        <>
                    <img src={cross} alt="Reject" className="action-icon" onClick={handleDecline} title='Accept' />
                    <img src={tick} alt="Accept" className="action-icon" onClick={handleAccept} title='Reject'/>
                    </>
                    ) : (
                        <img src={accepted} alt="Accept" className="accepted-icon" title='Accepted' />
                        )}
                </div>
            </div>
            <img className='received-icon' src={received} alt="Received Request" title='Received Request' />

        </div>
    );
};

export default ReceivedRequest;
