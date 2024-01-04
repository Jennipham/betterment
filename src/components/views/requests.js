import React from 'react';
import Header from '../utils/header';
import '../styles/Requests.css';
import Footer from '../utils/footer';
import { useState } from 'react';
import SentRequest from './sentRequest';
import ReceivedRequest from './receivedRequest';

const Requests = () => {

    const [receivedRequests, setReceivedRequests] = useState(['Monica Luu']);
    const [sentRequests, setSentRequests] = useState(['Jennifer Pham']);

    return (
        <>
            <Header loggedIn={true} />
           
            <div className="requests-page">
                <div className="requests-box">
                    <h2>Received Requests</h2>
                    {receivedRequests.map(request => (
                        <ReceivedRequest key={request.id} request={request} />
                    ))}
                </div>
                <div className="requests-box">
                    <h2>Sent Requests</h2>
                    {sentRequests.map(request => (
                        <SentRequest key={request.id} request={request} />
                    ))}
                </div>
            </div>
            
            <Footer />
        </>
    );
};

export default Requests;
