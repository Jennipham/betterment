import React, { useState } from 'react';
import '../styles/About.css';
import createProfile from '../images/create-profile.png';
import preferences from '../images/preferences.png';
import handshake from '../images/handshake.png';



const About = () => {
    const [activeButton, setActiveButton] = useState('I am a Mentee');

    const handleFindCoachClick = () => {
        setActiveButton('I am a Mentee');
    };

    const handleIAmCoachClick = () => {
        setActiveButton('I am a Coach');
    };

    const handleIAmAdminClick = () => {
        setActiveButton('I am a Manager');
    };

    return (
        <div className="about-container" id="about-section">
            <h2>How It Works</h2>
                <div className="buttons-about">
                    <button
                        onClick={() => {
                            handleFindCoachClick();
                        }}
                        className={`find-coach-button ${activeButton === 'I am a Mentee' ? 'active' : ''
                            }`}
                    >
                        I am a Mentee
                    </button>
                    <button
                        onClick={() => {
                            handleIAmCoachClick();
                        }}
                        className={`i-am-coach-button ${activeButton === 'I am a Mentor' ? 'active' : ''
                            }`}
                    >
                        I am a Mentor
                    </button>
                    <button
                        onClick={() => {
                            handleIAmAdminClick();
                        }}
                        className={`i-am-coach-button ${activeButton === 'I am a Manager' ? 'active' : ''
                            }`}
                    >
                        I am a Manager
                    </button>
                </div>
                <div className="card-container">
                    {activeButton === 'I am a Mentee' && (
                        <>
                            <div className="card">
                                <p>1. Create Your Profile</p>
                                <img src={createProfile} alt="create-profile" />
                                <h3>
                                    Sign Up to join the network of employees to find a mentor
                                </h3>
                            </div>
                            <div className="card">
                                <p>2. Set Your Preferences</p>
                                <img src={preferences} alt="preferences" />
                                <h3>
                                    Let us know all about your development goals and learning
                                    preferences so that we can find you an appropriate mentor
                                </h3>
                            </div>
                            <div className="card">
                                <p>3. Get Connected!</p>
                                <img src={handshake} alt="get-connected" />
                                <h3>
                                Our matching algorithm will provide you with a list of the
                                    most compatible employees to get you matched!
                                </h3>
                            </div>
                        </>
                    )}

                    {activeButton === 'I am a Coach' && (
                        <>
                            <div className="card-coach">
                                <p>1. Create Your Profile</p>
                                <img src={createProfile} alt="create-profile" />
                                <h3>
                                    Sign Up to join the network of mentors looking to match to an
                                    employee
                                </h3>
                            </div>
                            <div className="card-coach">
                                <p>2. Set your Preferences</p>
                                <img src={preferences} alt="preferences" />
                                <h3>
                                    Let us know all about your development specialities,
                                    qualifications, and preferences so that we can find you an
                                    appropriate employee to mentor
                                </h3>
                            </div>
                            <div className="card-coach">
                                <p>3. Get Connected!</p>
                                <img src={handshake} alt="get-connected" />
                                <h3>
                                    Our matching algorithm will provide you with a list of the
                                    most compatible employees to get you matched!
                                </h3>
                            </div>
                        </>
                    )}
                    {activeButton === 'I am a Manager' && (
                        <>
                            <div className="card">
                                <p>1. Create Your Profile</p>
                                <img src={createProfile} alt="create-profile" />
                                <h3>
                                    Sign Up to join BetterMent's network of organisations
                                </h3>
                            </div>
                            <div className="card">
                                <p>2. Set your Preferences</p>
                                <img src={preferences} alt="preferences" />
                                <h3>
                                    Let us know all about your organisation's matching preferences and preferred practices
                                </h3>
                            </div>
                            <div className="card">
                                <p>3. Gain insights into the Mentoring Program</p>
                                <img src={handshake} alt="get-connected" />
                                <h3>
                                    Invite mentors and mentees within your organisation, monitor their progress and the performance of the mentoring program
                                </h3>
                            </div>
                        </>
                    )}
                </div>
        </div>
    );
};

export default About;
