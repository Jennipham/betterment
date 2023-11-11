import React from 'react';
import Header from './header';
import '../styles/Terms.css';
import Footer from './footer';

const TermsOfUse = () => {
    

    return (
        <>
            <Header loggedIn={true} />
            <div className="terms-page">
                    <h1 className="terms-message">Terms of Use</h1>
            </div>
            <Footer />
        </>
    );
};

export default TermsOfUse;
