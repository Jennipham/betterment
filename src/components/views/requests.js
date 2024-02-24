import React, { useState, useEffect } from 'react';
import Header from '../utils/header';
import '../styles/Requests.css';
import Footer from '../utils/footer';
import SentRequest from './sentRequest';
import ReceivedRequest from './receivedRequest';
import Tooltip from '../utils/tooltip';
import moreInfo from '../images/more-info-icon.png';
import axios from 'axios';
import Loader from '../utils/loader';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


const Requests = () => {

    const calculateDaysLeft = () => {
        const matchingRoundDate = new Date();

        // Set the time to be the next occurrence of the matching round (e.g., every 14 days)
        matchingRoundDate.setDate(matchingRoundDate.getDate() + 14);

        // Calculate the time difference in milliseconds
        const timeDiff = matchingRoundDate.getTime() - Date.now();

        // Calculate days left
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return daysLeft > 0 ? daysLeft : 0; // Ensure daysLeft is non-negative
    };

    const [daysLeft, setDaysLeft] = useState(calculateDaysLeft());

    const [isMatched, setIsMatched] = useState(false);

    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [allRequests, setAllRequests] = useState([]);

    const [iframeLoading, setIframeLoading] = useState(true);

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


                if (userType !== '') {
                    const userResponse = await axios.post('http://localhost:3001/getProfile', {
                        email: email,
                        userType: userType,
                    })


                    if (userResponse.data.match !== '') {
                        setIsMatched(true);
                    }
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

                console.log('Combined Requests:', combinedRequests);

                // Fetch shortlistOrder
                const shortlistOrderResponse = await axios.post('http://localhost:3001/getShortlistOrder', {
                    email,
                    userType,
                });

                if (shortlistOrderResponse.data.shortlistOrder.length === 0) {
                    // No shortlist order, set sortedRequests to combinedRequests directly
                    setAllRequests(combinedRequests);
                } else {
                    // Sort the combined requests based on the order in shortlistOrder
                    const shortlistOrderIds = shortlistOrderResponse.data.shortlistOrder.map(orderItem => orderItem.requestId);

                    // Filter out the shortlisted requests from combinedRequests
                    const shortlistedRequests = combinedRequests.filter(request => shortlistOrderIds.includes(request._id));

                    // Filter out the unmatched requests from combinedRequests
                    const unmatchedRequests = combinedRequests.filter(request => !shortlistOrderIds.includes(request._id));

                    // Sort the shortlisted requests based on the order in shortlistOrder
                    const sortedShortlistRequests = shortlistOrderResponse.data.shortlistOrder.map(orderItem => {
                        const matchingRequest = shortlistedRequests.find(request => request._id === orderItem.requestId);
                        return matchingRequest ? { ...matchingRequest, index: orderItem.index } : null;
                    }).filter(Boolean);

                    // Combine the sorted shortlisted requests with unmatched requests
                    const sortedRequests = [...sortedShortlistRequests, ...unmatchedRequests];

                    // Update the state with sorted requests
                    setAllRequests(sortedRequests);
                }
            } catch (error) {
                console.error('Error fetching requests:', error);

                setTimeout(() => {
                    setErrorMessage('Error fetching requests:');
                }, 5000);
            }
        };

        fetchData();
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

            setTimeout(() => {
                setSuccessMessage("Shortlist Sucessfully Saved")
            }, 5000);
            console.log('Successfully updated order on the server');
        } catch (error) {
            console.error('Error updating order on the server:', error);
        }
    };

    const onRemoveSentRequest = (emailToRemove) => {
        setSentRequests(sentRequests.filter(request => request.receiverEmail !== emailToRemove));
        setAllRequests(allRequests.filter(request => request.receiverEmail !== emailToRemove));
    };

    const onDecline = (declinedRequest) => {
        setReceivedRequests(receivedRequests.filter(request => request.senderEmail !== declinedRequest.senderEmail));
        setAllRequests(allRequests.filter(request => request.senderEmail !== declinedRequest.senderEmail));

    };

    const hasShortlistOrder = allRequests.length > 0;


    return (
        <>
            <Header />
            {isMatched && (
                <div className="requests-page">
                    <h2>Feedback Questionnaire</h2>

                    {iframeLoading ? <Loader /> : <></>}
                    <>
                        <iframe src="https://docs.google.com/forms/d/e/1FAIpQLScr8utdzUpX86YZn5eQdt7pCYXdZCyr6vblCw9sKMHpcA_wkw/viewform?embedded=true"
                            className="questionnaire"
                            width="640"
                            height="414"
                            frameborder="0"
                            marginheight="0"
                            marginwidth="0"
                            onLoad={() => setIframeLoading(false)}
                        >
                        </iframe>
                    </>
                </div>

            )}


            {!isMatched && (

                <div className="requests-page">
                    <div className='error-message-profile-container'>
                        {errorMessage && <p className="error-message-profile">{errorMessage}</p>}
                    </div>
                    <div className='success-message-profile-container'>
                        {successMessage && <p className="success-message-profile">{successMessage}</p>}
                    </div>
                    <div className="requests-box">
                        <h2>
                            Shortlist
                            <Tooltip text="Create your shortlist in order of preference">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                            </Tooltip>
                        </h2>

                        {hasShortlistOrder && (
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
                                                            className="shortlist-item"
                                                        >
                                                            <div className="shortlist-number">{index + 1}.</div>

                                                            {request && request.type === 'received' ? (
                                                                <ReceivedRequest
                                                                    key={request.senderEmail}
                                                                    request={request}
                                                                    onDecline={onDecline}
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
                        )}

                        {!hasShortlistOrder && (
                            <div>
                                {allRequests.map((request) => (
                                    request && request.type === 'sent' ? (
                                        <SentRequest
                                            key={request.receiverEmail}
                                            request={request}
                                            onRemoveRequest={onRemoveSentRequest}
                                        />
                                    ) : request && request.type === 'received' ? (
                                        <ReceivedRequest
                                            key={request.senderEmail}
                                            request={request}
                                            onDecline={onDecline}
                                        />
                                    ) : null
                                ))}
                            </div>
                        )}

                    </div>
                    <button className='save-shortlist' onClick={onSaveShortlistClick}>Save</button>
                </div>

            )}

            <Footer />
        </>
    );
};


export default Requests;
