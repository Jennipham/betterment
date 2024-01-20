import React, { useState, useEffect } from 'react';
import Header from '../utils/header';
import '../styles/Requests.css';
import Footer from '../utils/footer';
import SentRequest from './sentRequest';
import ReceivedRequest from './receivedRequest';
import axios from 'axios';

const Requests = () => {
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const email = sessionStorage.getItem('email');
                const userType = sessionStorage.getItem('userType');


                if (!email || !userType) {
                    console.error('User information is missing.');
                    return;
                }

                // Fetch received requests directly using user information
                const receivedResponse = await axios.post('http://localhost:3001/getReceivedRequests', {
                    email,
                    userType,
                });
                setReceivedRequests(receivedResponse.data.receivedRequests);

                // Fetch sent requests
                const sentResponse = await axios.post('http://localhost:3001/getSentRequests', {
                    email,
                    userType,
                });

                setSentRequests(sentResponse.data.sentRequests);

            } catch (error) {
                console.error('Error fetching requests:', error);
                setErrorMessage('Error fetching requests:');
            }
        };

        fetchData();
    }, []);


    const onRemoveSentRequest = (emailToRemove) => {
        setSentRequests(sentRequests.filter(request => request.receiverEmail !== emailToRemove));
    };

    const onDecline = (declinedRequest) => {
        setReceivedRequests(receivedRequests.filter(request => request.senderEmail !== declinedRequest.senderEmail));
    };

    const onAccept = (acceptedRequest) => {
        setReceivedRequests(receivedRequests.filter(request => request.senderEmail !== acceptedRequest.senderEmail));
    };


    return (
        <>
            <Header />

            <div className="requests-page">
                <div className='error-message-profile-container'>
                    {errorMessage && <p className="error-message-profile">{errorMessage}</p>}
                </div>
                <div className="requests-box">
                    <h2>Received Requests</h2>
                    {receivedRequests.map((request) => (
                        request && request.senderEmail ? (
                            <ReceivedRequest key={request.senderEmail} request={request} onDecline= {onDecline} onAccept = {onAccept} />
                        ) : null
                    ))}
                </div>
                <div className="requests-box">
                    <h2>Sent Requests</h2>
                    {sentRequests.map((request) => (
                        request && request.receiverEmail ? (
                            <SentRequest key={request.receiverEmail} request={request} onRemoveRequest={onRemoveSentRequest} />
                        ) : null
                    ))}
                </div>
            </div>

            <Footer />
        </>
    );

};

export default Requests;
