import React from 'react';
import Header from '../utils/header';
import '../styles/NoPermissions.css';
import Footer from '../utils/footer';
import warning from '../images/warning-icon.png';


const NoPermissions = () => {


    return (
        <>
            <Header loggedIn={true} />
            <div className="no-permissions-container">
                <img src={warning} alt="warning-icon" className='warning-icon' />
                <div className="error-caption">
                    <p>Sorry, you do not have permission to access this page.</p>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default NoPermissions;