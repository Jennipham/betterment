import React from 'react';
import profile from '../images/profile-black.png';
import cross from '../images/cross-icon.png';
import sent from '../images/sent-icon.png';
import axios from 'axios';
import Loader from '../utils/loader';
import Modal from '../utils/modal';
import { useState, useEffect } from 'react';
import '../styles/SentRequests.css';

const SentRequest = ({ request, onRemoveRequest }) => {

    console.log('sent', request);

    const email = sessionStorage.getItem('email');
    const userType = sessionStorage.getItem('userType');
    const [loading, setLoading] = useState(false);

    const [matchProfile, setMatchProfile] = useState([]);
    const [matchFname, setMatchFname] = useState('');
    const [matchSname, setMatchSname] = useState('');
    const [matchUserType, setMatchUserType] = useState('');


    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (request) => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const fetchMatchProfile = async () => {
            try {
                // Fetch user details
                const userDetailsResponse = await axios.get(`http://localhost:3001/getUserDetails?email=${request.receiverEmail}`);
                const userDetails = userDetailsResponse.data.user;

                // Set user details
                setMatchFname(userDetails.fname);
                setMatchSname(userDetails.sname);
                setMatchUserType(userDetails.userType);

                // Fetch user profile
                const userResponse = await axios.post('http://localhost:3001/getProfile', {
                    email: request.receiverEmail,
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
    }, [request.receiverEmail]); // Add dependencies to the dependency array

    const handleCancelClick = async () => {
        setLoading(true);
        try {
            // Make API call to delete the email from sentRequests
            await axios.delete(`http://localhost:3001/cancelRequest/${request.receiverEmail}`, {
                data: { email: email, userType: userType }
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
                loading ? (
                    <Loader />
                ) : (
                        <div className='sent-container'>

                    <div className={`request-box-sent ${isExpired ? 'expired-request' : ''}`}>
                        <div className='icon-box'>
                            <button className="match-profile-button" onClick={() => openModal(request)}>
                                <img className='request-profile-icon' src={profile} alt="Profile Icon" />
                            </button>
                            <button className="view-profile" onClick={() => openModal(request)}>View Full Profile</button>
                            {isModalOpen && (
                                <Modal onClose={handleCloseModal}>
                                            <iframe title="Full Profile" src={`/fullprofile/${request.receiverEmail}`} width="100%" height="100%">
                                                </iframe>
                                </Modal>
                            )}
                        </div>
                        <div className="sent-profile-info">
                            <p className='sent-name'>{`${matchFname} ${matchSname}`}</p>
                        </div>
                        <div className='action-buttons'>
                            <img src={cross} alt="Cancel" className="action-icon" onClick={handleCancelClick} />
                        </div>
                            </div>
                            <img className='sent-icon' src={sent} alt="Sent Request" title='Sent Request' />

                            </div>
                )
            }</>);
};

export default SentRequest;
