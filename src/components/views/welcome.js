import React from 'react';
import Header from './header';
import { useState, useEffect } from 'react';
import '../styles/Welcome.css';

const Welcome = () => {
    const [user, setUser] = useState({ name: '' });

    // Fetch user information after the component is mounted
    useEffect(() => {
        // Make an API request to your server to get user information
        // You should replace this with your actual API endpoint
        fetch('/api/user-info')
            .then((response) => response.json())
            .then((data) => {
                setUser({ fname: data.fname }); // Update the user state with the name
            })
            .catch((error) => {
                console.error('Error fetching user information:', error);
            });
    }, []);
    return (
        <>
            <Header loggedIn={true}/>
        <div className="welcome-page">
            <div className="welcome-box">
                    <h1 classname="welcome-message">Welcome to BetterMent {user.fname}!</h1>
                <button>Go to Profile</button>
            </div>
            </div>
        </>
    );
};

export default Welcome;