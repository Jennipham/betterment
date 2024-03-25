import React from 'react';
import Header from '../../utils/header';
import '../../styles/ExpiredSession.css';
import Footer from '../../utils/footer';
import warning from '../../images/warning-icon.png';

const ExpiredSession = () => {

return (
    <>
        <Header />
        <div className="expired-session-container">
            <img src={warning} alt="warning-icon" className='warning-icon' />
            <div className="error-caption">
                <p>Your session has expired - Please Log in Again.</p>
            </div>
        </div>

        <Footer />
    </>
);
};


export default ExpiredSession;
