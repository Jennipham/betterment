import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './header';
import Footer from './footer';

const Help = () => {
    const location = useLocation();
    const user = location.state?.user || { email: 'guest@example.com' };
    const [formMessage, setFormMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post('http://localhost:3001/send-form', {
                email: user.email,
                formMessage,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

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
        <div>
            <Header loggedIn={true} />
            <h2>Help</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Message:
                    <textarea value={formMessage} onChange={(e) => setFormMessage(e.target.value)} />
                </label>
                <button type="submit">Submit Form</button>
            </form>
            <Footer />
        </div>
    );
};

export default Help;
