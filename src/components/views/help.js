// Help.js

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../utils/header';
import Footer from '../utils/footer';
import '../styles/Help.css';

const Help = () => {
    const location = useLocation();
    const user = location.state?.user || { email: 'guest@example.com' };
    const [formMessage, setFormMessage] = useState('');

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
                alert('Form submitted successfully!');
            } else {
                alert('Failed to submit form. Please try again later.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit form. Please try again later.');
        }
    };

    return (
        <>
            <Header loggedIn={true} className="header" />

        <div className="help-page">
            <h2 className="help-header">Contact Us</h2>
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <label>
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
