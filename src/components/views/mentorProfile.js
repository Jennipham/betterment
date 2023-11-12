import React from 'react';
import Header from './header';
import '../styles/Welcome.css';
import Footer from './footer';

const MentorProfile = () => {

    return (
        <>
            <Header loggedIn={true} />
            
            <Footer />
        </>
    );
};

export default MentorProfile;
