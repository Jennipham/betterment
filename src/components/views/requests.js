import React, { useState, useEffect } from 'react';
import Header from '../utils/header';
import '../styles/Requests.css';
import Footer from '../utils/footer';
import SentRequest from './sentRequest';
import ReceivedRequest from './receivedRequest';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


const Requests = () => {
    const [daysLeft, setDaysLeft] = useState(calculateDaysLeft());

    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');

    const [allRequests, setAllRequests] = useState([]);

    const calculateDaysLeft = () => {
        // Set the time for the next matching round (adjust this based on your requirements)
        const matchingRoundDate = new Date();
        
        // Set the time to be the next occurrence of the matching round (e.g., every 14 days)
        matchingRoundDate.setDate(matchingRoundDate.getDate() + 14);
    
        // Calculate the time difference in milliseconds
        const timeDiff = matchingRoundDate.getTime() - Date.now();
    
        // Calculate days left
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
        return daysLeft > 0 ? daysLeft : 0; // Ensure daysLeft is non-negative
    };
    

    useEffect(() => {
        const interval = setInterval(() => {
            setDaysLeft(prevDays => prevDays - 1);
        }, 24 * 60 * 60 * 1000); // Update every 24 hours

        return () => clearInterval(interval); // Cleanup interval on component unmount

    }, []);

    const onDragEnd = async (result) => {
        if (!result.destination) {
            return; // Dropped outside the list
        }

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        const updatedAllRequests = [...allRequests];
        const [draggedItem] = updatedAllRequests.splice(sourceIndex, 1);
        updatedAllRequests.splice(destinationIndex, 0, draggedItem);

        setAllRequests(updatedAllRequests);
    };


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

                // Fetch sent requests
                const sentResponse = await axios.post('http://localhost:3001/getSentRequests', {
                    email,
                    userType,
                });

                // Combine received and sent requests
                const combinedRequests = [
                    ...receivedResponse.data.receivedRequests.map(request => ({ ...request, type: 'received' })),
                    ...sentResponse.data.sentRequests.map(request => ({ ...request, type: 'sent' })),
                ];

                // Fetch shortlistOrder
                const shortlistOrderResponse = await axios.post('http://localhost:3001/getShortlistOrder', {
                    email,
                    userType,
                });

                // Sort the combined requests based on the order in shortlistOrder
                const sortedRequests = shortlistOrderResponse.data.shortlistOrder.map(orderItem => {
                    const matchingRequest = combinedRequests.find(request => request._id === orderItem.requestId);
                    return matchingRequest ? { ...matchingRequest, index: orderItem.index } : null;
                }).filter(Boolean);

                // Update the state with sorted requests
                setAllRequests(sortedRequests);

            } catch (error) {
                console.error('Error fetching requests:', error);
                setErrorMessage('Error fetching requests:');
            }
        };

        fetchData();
    }, []);


    const matchRound = async () => {
        try {
            const email = sessionStorage.getItem('email');
                const userType = sessionStorage.getItem('userType');

                if (!email || !userType) {
                    console.error('User information is missing.');
                    return;
                }

            const response = await axios.post('http://localhost:3001/match', {
                email,
                userType,
                        });

            const result = response.data;
            console.log(result);

        } catch (error) {
            console.error('Error triggering matching:', error);
        }
    };

    useEffect(() => {
        matchRound();
        const intervalId = setInterval(matchRound, 14 * 24 * 60 * 60 * 1000); // 14 days
        return () => clearInterval(intervalId);
    }, []);


    const onSaveShortlistClick = async () => {
        const email = sessionStorage.getItem('email');
        const userType = sessionStorage.getItem('userType');

        try {
            // Extract the order information from allRequests and send it to the server
            const orderInformation = allRequests.map((request, index) => ({
                requestId: request && request._id ? request._id : `undefined-${index}`,
                type: request ? request.type : 'unknown',
            }));

            await axios.post('http://localhost:3001/updateRequestOrder', {
                orderInformation,
                userType,
                email,
            });

            console.log('Successfully updated order on the server');
        } catch (error) {
            console.error('Error updating order on the server:', error);
        }
    };

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
                    <h2>Shortlist</h2>
                    <span className='round-countdown'>Next Matching Round: {daysLeft} days </span>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="allRequests">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {allRequests.map((request, index) => (
                                        <Draggable
                                            key={request && request._id ? request._id : `undefined-${index}`}
                                            draggableId={`${request ? request._id : 'undefined'}-${index}-${request ? request.type : 'unknown'}`}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    {request && request.type === 'received' ? (
                                                        <ReceivedRequest
                                                            key={request.senderEmail}
                                                            request={request}
                                                            onDecline={onDecline}
                                                            onAccept={onAccept}
                                                        />
                                                    ) : request && request.type === 'sent' ? (
                                                        <SentRequest
                                                            key={request.receiverEmail}
                                                            request={request}
                                                            onRemoveRequest={onRemoveSentRequest}
                                                        />
                                                    ) : null}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                </div>
                <button className='save-shortlist' onClick={onSaveShortlistClick}>Save</button>
            </div>

            <Footer />
        </>
    );
};

export default Requests;
