import React, { useState } from 'react';
import Header from './header';
import '../styles/Welcome.css';
import Footer from './footer';
import Modal from './modal';
import { useLocation } from 'react-router-dom';
import TermsOfUse from './termsOfUse';

const Welcome = () => {

    const location = useLocation(); // Use useLocation hook to access the state
    const user = location.state?.user || { fname: 'Guest' }; // Default to 'Guest' if user information is not available

    const [agreed, setAgreed] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleTermsClick = () => {
        setAgreed(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Header loggedIn={true} />
            <div className="welcome-page">
                <div className="welcome-box">
                    <h1 className="welcome-message">Welcome to BetterMent {user.fname}!</h1>
                    <h1 className="terms-agree">Please accept if you agree to the <span onClick={() => setIsModalOpen(true)} className='underline-link'>Terms and Conditions</span></h1>
                    <div className='profile-button'>
                        <button onClick={() => { handleTermsClick() }} className='accept'>Accept</button>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <Modal onClose={handleCloseModal}>
                    <iframe title="Terms of Use" src="/termsofuse" width="100%" height="100%" />
                    {/* <TermsOfUse /> */}
                </Modal>
            )}
            <Footer />
        </>
    );
};

export default Welcome;
