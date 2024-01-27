import React, { useState, useEffect } from 'react';
import Header from '../utils/header';
import '../styles/Requests.css';
import Footer from '../utils/footer';
import SentRequest from './sentRequest';
import ReceivedRequest from './receivedRequest';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


const Requests = () => {
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');

    const [allRequests, setAllRequests] = useState([]);

    // const onDragEnd = async (result) => {
    //     if (!result.destination) {
    //         return; // Dropped outside the list
    //     }

    //     const sourceIndex = result.source.index;
    //     const destinationIndex = result.destination.index;

    //     // If the drag is within receivedRequests
    //     if (result.source.droppableId === 'allRequests' && result.destination?.droppableId === 'allRequests') {
    //         const updatedReceivedRequests = allRequests
    //             .filter(request => request && request.type === 'received' && request._id)
    //             .map(request => ({ ...request }));

    //         const [reorderedReceivedItem] = updatedReceivedRequests.splice(sourceIndex, 1);
    //         updatedReceivedRequests.splice(destinationIndex, 0, reorderedReceivedItem);

    //         const updatedAllRequests = allRequests
    //             .filter(request => request && request.type !== 'received' && request._id)
    //             .concat(updatedReceivedRequests)
    //             .sort((a, b) => a.index - b.index);

    //         setAllRequests(updatedAllRequests);
    //     }

    //     // If the drag is within sentRequests
    //     if (result.source.droppableId === 'allRequests' && result.destination?.droppableId === 'allRequests') {
    //         const updatedSentRequests = allRequests
    //             .filter(request => request && request.type === 'sent' && request._id)
    //             .map(request => ({ ...request }));

    //         const [reorderedSentItem] = updatedSentRequests.splice(sourceIndex, 1);
    //         updatedSentRequests.splice(destinationIndex, 0, reorderedSentItem);

    //         // Filter out null entries
    //         const filteredSentRequests = updatedSentRequests.filter(Boolean);

    //         const updatedAllRequests = allRequests
    //             .filter(request => request.type !== 'sent')
    //             .concat(filteredSentRequests)
    //             .sort((a, b) => a.index - b.index);

    //         setAllRequests(updatedAllRequests);
    //     }

    //     const email = sessionStorage.getItem('email');
    //     const userType = sessionStorage.getItem('userType');

    //     // try {
    //     //     await axios.post('http://localhost:3001/updateRequestOrder', { allRequests, userType, email });
    //     //     console.log('Successfully updated order on the server');
    //     // } catch (error) {
    //     //     console.error('Error updating order on the server:', error);
    //     // }

    //     console.log('After Drag:', allRequests);
    // };


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
                setReceivedRequests(receivedResponse.data.receivedRequests);

                // Fetch sent requests
                const sentResponse = await axios.post('http://localhost:3001/getSentRequests', {
                    email,
                    userType,
                });

                setSentRequests(sentResponse.data.sentRequests);

                const combinedRequests = [
                    ...receivedResponse.data.receivedRequests.map(request => ({ ...request, type: 'received' })),
                    ...sentResponse.data.sentRequests.map(request => ({ ...request, type: 'sent' })),
                ];

                const sortedRequests = combinedRequests.sort((a, b) => a.index - b.index);

                setAllRequests(sortedRequests);

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
                    <h2>Shortlist</h2>
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
                <button className='save-shortlist'>Save</button>
            </div>

            <Footer />
        </>
    );
};

export default Requests;
