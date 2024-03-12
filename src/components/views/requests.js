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

    const [isMatched, setIsMatched] = useState(false);

    const [daysUntilNextMatch, setDaysUntilNextMatch] = useState(null);

    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [profile, setProfile] = useState();
    const [matchingMethod, setMatchingMethod] = useState();

    const [allRequests, setAllRequests] = useState([]);

    const [iframeLoading, setIframeLoading] = useState(true);
    const [shortlistLoading, setShortlistLoading] = useState(false);

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
        // Fetch the number of days until the next match from the backend
        const fetchDaysUntilNextMatch = async () => {
            try {
                const response = await axios.get('http://localhost:3001/getNextMatchDay');
                setDaysUntilNextMatch(response.data.daysUntilNextMatch);
            } catch (error) {
                console.error('Error fetching days until next match:', error);
            }
        };

        fetchDaysUntilNextMatch();
    }, []);

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
                    });
    
                    if (Array.isArray(userResponse.data.profile.profileInfo.matches) && userResponse.data.profile.profileInfo.matches.length > 0) {
                        setIsMatched(true);
                    }
                }
    
                // Fetch received requests directly using user information
                const receivedResponse = await axios.post('http://localhost:3001/getReceivedRequests', {
                    email,
                    userType,
                });
    
                // Filter out received requests from users who have available: false and are not declined
                const filteredReceivedRequests = await Promise.all(receivedResponse.data.receivedRequests.map(async (request) => {
                    const senderProfileResponse = await axios.post('http://localhost:3001/getProfile', {
                        email: request.senderEmail,
                        userType: userType === "mentee" ? "mentor" : "mentee",
                    });
                    if (senderProfileResponse.data.profile.profileInfo.available && !request.declined) {
                        return request;
                    }
                }));
    
                setReceivedRequests(filteredReceivedRequests.filter(Boolean));
    
            } catch (error) {
                console.error('Error fetching received requests:', error);
                setTimeout(() => {
                    setErrorMessage('Error fetching received requests:');
                }, 5000);
            }
        };
    
        fetchData();
    }, []);
    
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
                    });
    
                    if (Array.isArray(userResponse.data.profile.profileInfo.matches) && userResponse.data.profile.profileInfo.matches.length > 0) {
                        setIsMatched(true);
                    }
                }
    
                // Fetch sent requests
                const sentResponse = await axios.post('http://localhost:3001/getSentRequests', {
                    email,
                    userType,
                });
    
                // Filter out sent requests to users who have available: false and are not declined
                const filteredSentRequests = await Promise.all(sentResponse.data.sentRequests.map(async (request) => {
                    const receiverProfileResponse = await axios.post('http://localhost:3001/getProfile', {
                        email: request.receiverEmail,
                        userType: userType === "mentee" ? "mentor" : "mentee",
                    });
                    if (receiverProfileResponse.data.profile.profileInfo.available) {
                        return request;
                    }
                }));
    
                setSentRequests(filteredSentRequests.filter(Boolean));
    
            } catch (error) {
                console.error('Error fetching sent requests:', error);
                setTimeout(() => {
                    setErrorMessage('Error fetching sent requests:');
                }, 5000);
            }
        };
    
        fetchData();
    }, []);
    
    useEffect(() => {
        // Combine received and sent requests
        const combinedRequests = [
            ...receivedRequests.map(request => ({ ...request, type: 'received' })),
            ...sentRequests.map(request => ({ ...request, type: 'sent' })),
        ].filter(request => {
            // Check if the request object contains all the required properties
            if (
                request &&
                request._id &&
                request.type &&
                request.accepted !== undefined &&
                ((request.type === 'received' && request.senderEmail) ||
                (request.type === 'sent' && request.receiverEmail))
            ) {
                return true;
            }
            return false;
        });
    
        // Fetch shortlistOrder
        const fetchShortlistOrder = async () => {
            try {
                const email = sessionStorage.getItem('email');
                const userType = sessionStorage.getItem('userType');
    
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
                console.error('Error fetching shortlist order:', error);
                setTimeout(() => {
                    setErrorMessage('Error fetching shortlist order:');
                }, 5000);
            }
        };
    
        fetchShortlistOrder();
    
    }, [receivedRequests, sentRequests]);
    


    useEffect(() => {
        const fetchUserProfileAndMatchSettings = async () => {
            try {
                const email = sessionStorage.getItem('email');
                const userType = sessionStorage.getItem('userType');

                // Fetch user profile
                const profileResponse = await axios.post('http://localhost:3001/getProfile', {
                    email: email,
                    userType: userType,
                });
                setProfile(profileResponse.data);

                // Fetch admin match settings
                if (profileResponse && profileResponse.data && profileResponse.data.profile && profileResponse.data.profile.profileInfo && profileResponse.data.profile.profileInfo.admin) {
                    const matchSettingsResponse = await axios.get('http://localhost:3001/getAdminMatchingSettings', {
                        params: { email: profileResponse.data.profile.profileInfo.admin }
                    });
                    const { blindMatching, matchingMethod } = matchSettingsResponse.data;

                    setMatchingMethod(matchingMethod);
                }
            } catch (error) {
                console.error('Error fetching profile and match settings:', error);
            }
        };

        fetchUserProfileAndMatchSettings();
    }, []);


    const onSaveShortlistClick = async () => {
        const email = sessionStorage.getItem('email');
        const userType = sessionStorage.getItem('userType');

        setShortlistLoading(true);

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

            setSuccessMessage("Shortlist Sucessfully Saved");

            const timeoutId = setTimeout(() => {
                setSuccessMessage("");
            }, 5000);

            // Cleanup timeout on component unmount
            return () => clearTimeout(timeoutId);

            console.log('Successfully updated order on the server');
        } catch (error) {
            console.error('Error updating order on the server:', error);
        }
        finally {
            setShortlistLoading(false);
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
            {isMatched || matchingMethod === 'Random' ? (
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

            ) : <></>}


            {!isMatched && matchingMethod !== 'Random' ? (
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
                            <Tooltip text="Drag and drop your requests to put them in order of preference to be matched.">
                                <img src={moreInfo} alt="More Info" className="more-info-icon" />
                            </Tooltip>
                        </h2>

                        {daysUntilNextMatch !== null && (
                            <p className='next-match'>Days until next match: {daysUntilNextMatch}</p>
                        )}

                        {allRequests.length > 0 ? (
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
                        ) : (
                            <p className="no-requests-message">You have no sent or received requests at the moment. <br></br>Please go to the matching page to view potential matches.</p>
                        )}
                    </div>
                    {hasShortlistOrder && (
                        <button className='save-shortlist' onClick={onSaveShortlistClick}>{shortlistLoading ? <Loader /> : "Save"}</button>
                    )}
                </div>
            ) : <></>}

            <Footer />
        </>
    );
};

export default Requests;
