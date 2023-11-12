import React from 'react';
import Header from './header';
import '../styles/Welcome.css';
import Footer from './footer';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';



const Welcome = () => {

    const location = useLocation(); // Use useLocation hook to access the state
    const user = location.state?.user || { fname: 'Guest' }; // Default to 'Guest' if user information is not available

    const [agreed, setAgreed] = useState(false);


    const handleTermsClick = () => {
        setAgreed(true);
    };

    return (
        <>
            <Header loggedIn={true} />
            <div className="welcome-page">
                <div className="welcome-box">
                    <h1 className="welcome-message">Welcome to BetterMent {user.fname}!</h1>
                    <h1 className="terms-agree">Please accept if you agree to the <a href="/termsofuse" className='underline-link'>Terms and Conditions</a></h1>
                    <div className='profile-button'>
                        <button onClick={() => { handleTermsClick() }} className='accept'>Accept</button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Welcome;
