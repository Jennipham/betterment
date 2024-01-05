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

    const [user, setUser] = useState({
        firstName: sessionStorage.getItem('firstName') || 'User',
        lastName: sessionStorage.getItem('lastName') || '',
        userType: sessionStorage.getItem('userType') || '',
        email: sessionStorage.getItem('email') || '',
    });

    const [matchProfile, setMatchProfile] = useState({
        firstName: sessionStorage.getItem('firstName') || 'User',
        lastName: sessionStorage.getItem('lastName') || '',
        userType: sessionStorage.getItem('userType') || '',
        email: sessionStorage.getItem('email') || '',
        jobRole: sessionStorage.getItem('jobRole') || '',
        officeLocation: sessionStorage.getItem('officeLocation') || '',
        developmentAreas: sessionStorage.getItem('developmentAreas') || '',
        mentoringMethods: sessionStorage.getItem('mentoringMethods') || '',
        languages: sessionStorage.getItem('languages') || '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const email = sessionStorage.getItem('email');
                const userType = sessionStorage.getItem('userType');
                const firstName = sessionStorage.getItem('firstName');
                const lastName = sessionStorage.getItem('lastName');

                // Parse the string from sessionStorage to an object
                const receivedProfiles = JSON.parse(sessionStorage.getItem('matchProfile'));

                setUser({ firstName, lastName, email, userType });
                setMatchProfile(receivedProfiles);

                if (!email || !userType) {
                    console.error('User information is missing.');
                    return;
                }

                // Fetch received requests
                const receivedResponse = await axios.post('http://localhost:3001/getReceivedRequests', {
                    email: matchProfile.email,
                    userType: matchProfile.userType,
                });
                setReceivedRequests(receivedResponse.data.receivedRequests);

                // Fetch sent requests
                const sentResponse = await axios.post('http://localhost:3001/getSentRequests', {
                    email: user.email,
                    userType: user.userType,
                });
                setSentRequests(sentResponse.data.sentRequests);
            } catch (error) {
                console.error('Error fetching requests:', error);
            }
        };

        fetchData();
    }, [user.email, user.userType]); // Added dependencies to useEffect

    return (
        <>
            <Header loggedIn={true} />

            <div className="requests-page">
                <div className="requests-box">
                    <h2>Received Requests</h2>
                    {receivedRequests.map((request) => (
                        <ReceivedRequest key={request.email} request={request} />
                    ))}
                </div>
                <div className="requests-box">
                    <h2>Sent Requests</h2>
                    {sentRequests.map((request) => (
                        <SentRequest key={request.email} request={request} />
                    ))}
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Requests;
