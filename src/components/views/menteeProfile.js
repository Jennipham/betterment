import React from 'react';
import Header from './header';
import '../styles/Welcome.css';
import Footer from './footer';

const MenteeProfile = () => {

    return (
        <>
            <Header loggedIn={true} />

            <Footer />
        </>
    );
};

export default MenteeProfile;
