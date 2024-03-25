// Help.js

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../utils/header';
import Footer from '../../utils/footer';
import Faqs from './faqs';
import '../../styles/Help.css';

const Help = () => {
    const location = useLocation();
    const user = location.state?.user || { email: 'guest@example.com' };
    const [formMessage, setFormMessage] = useState('');

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const faqData = [
        {
            question: "What is BetterMent?",
            answer: "BetterMent is an online platform that takes user profile information and matches employees to executive mentors within an organisation. BetterMent aims to optimise match pairing as opposed to just match suggestions for users in order to optimise mentoring initiatives for mentees,mentors and the wider organisation."
        },
        {
            question: "How does matching work?",
            answer: "Betterment provides 3 methods of matching. The first is random allocation. The second is manual matching where users can filter through and choose their match. The final method is the Betterment Algorithm which creates a similarity score between profiles for users to add their preferred matches to a shortlist. Users can order this shortlist in order of match preference and after 2 weeks this will be fed into the Gale-Shapely Algorithm where matches will be allocated."
        },
        {
            question: "How is the matching method picked?",
            answer: "Your manager will decide which matching method they would like for your organisation. If they have not chosen yet then this will default to Betterment's Algorithm."
        },
        {
            question: "What do I do once potential matches are displayed?",
            answer: "If your matching method has not been set to random, you may request a match with a potential match where they can either decline or accept. All of your requests will be displayed in your shortlist where you may order your requests in order of preference."
        },
        {
            question: "What is Blind Matching?",
            answer: "Blind matching is an option provided which will hide the names on the profiles of potential matches to mitigate bias. Your manager will choose to have this setting on or off."
        },
        {
            question: "I've been matched, what now?",
            answer: "Congratulations! Once Betterment has found you a match, you can choose to contact your match which will open up an email template for you to send to your mentor. You will also be notified to complete a user experience questionnaire. 2 weeks after you have been matched, your account will be automatically deleted."
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3001/send-form',
                {
                    email: user.email,
                    formMessage,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setSuccessMessage('Form submitted successfully!');
            } else {
                setErrorMessage('Failed to submit form. Please try again later.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage('Failed to submit form. Please try again later.');
        }
    };

    return (
        <>
            <Header className="header" />

            <div className="help-page">
                <h2 className="help-header">Contact Us</h2>
                <div className='error-message-profile-container'>
                    {errorMessage && <p className="error-message-profile">{errorMessage}</p>}
                </div>
                <div className='success-message-profile-container'>
                    {successMessage && <p className="success-message-profile">{successMessage}</p>}
                </div>
                <div className='contact-form'>
                    <form onSubmit={handleSubmit}>
                        <label className='contact-label'>
                            Please leave any Feedback or Queries:
                            <textarea
                                value={formMessage}
                                onChange={(e) => setFormMessage(e.target.value)}
                            />
                        </label>
                        <button type="submit">Submit Form</button>
                    </form>
                </div>
                <div className='faqs-help'>
                <Faqs faqData={faqData} />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Help;
