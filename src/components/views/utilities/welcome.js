import React, { useState } from 'react';
import Header from '../../utils/header';
import '../../styles/Welcome.css';
import Footer from '../../utils/footer';
import Modal from '../../utils/modal';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const Welcome = () => {

    const navigate = useNavigate();

    const location = useLocation();
    const user = location.state?.user || { fname: 'Guest' };
    const { userType, email } = user;

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleTermsClick = () => {
        if (userType === 'mentee' || userType === 'mentor') {
            console.log("Navigating to Profile with user:", user);
            navigate("/profileSettings", { state: { user: { userType: userType, email: email } } });
        } else if (userType === 'admin') {
            navigate("/adminSettings", { state: { user: { userType: userType, email: email } } });
        } else {
            navigate("/profileSettings", { state: { user: { userType: userType, email: email } } });
        }
    };



    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Header />
            <div className="welcome-page">
                <div className="welcome-box">
                    <h1 className="welcome-message">Welcome to Better<span className='ment'>Ment</span> {user.fname}!</h1>
                    <h1 className="terms-agree">Please accept if you agree to the <span onClick={() => setIsModalOpen(true)} className='underline-link'>Terms and Conditions</span></h1>
                    <div className='profile-button'>
                        <button onClick={() => { handleTermsClick() }} className='accept'>Accept</button>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <Modal onClose={handleCloseModal}>
                    <iframe title="Terms of Use" src="/termsofuse" width="100%" height="100%" />
                </Modal>
            )}
            <Footer />
        </>
    );
};

export default Welcome;
