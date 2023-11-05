import React from 'react';
import Header from './header';
import { useState, } from 'react';
import '../styles/Welcome.css';

const Welcome = () => {
    const [user, setUser] = useState({ fname: '{username}' });

    return (
        <>
            <Header loggedIn={true} />
            <div className="welcome-page">
                <div className="welcome-box">
                    <h1 classname="welcome-message">Welcome to BetterMent {user.fname}!</h1>
                    <div className='profile-button'>
                        <button>Go to Profile</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Welcome;