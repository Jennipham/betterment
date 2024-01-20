// Help.js

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../utils/header';
import Footer from '../utils/footer';
import Faqs from './faqs';
import '../styles/Help.css';

const Help = () => {
    const location = useLocation();
    const user = location.state?.user || { email: 'guest@example.com' };
    const [formMessage, setFormMessage] = useState('');

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const faqData = [
        {
            question: "What is BetterMent?",
            answer: "BetterMent is a platform that..."
        },
        {
            question: "How do I get started?",
            answer: "To sign up as a mentor, go to our registration page and fill out the necessary information."
        },
        {
            question: "How does the matching algorithm work?",
            answer: "The algorithm is..."
        },
        {
            question: "Why Development Coaching?",
            answer: "Development coaching..."
        },
        {
            question: "What Development Areas are available?",
            answer: "Areas available include..."
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
                <div className='faqs-help'>
                <Faqs faqData={faqData} />
                </div>
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
                </div>
            <Footer />
        </>
    );
};

export default Help;
