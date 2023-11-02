import React, { useState } from 'react';
import '../styles/About.css';
import createProfile from '../images/create-profile.png';
import preferences from '../images/preferences.png';
import handshake from '../images/handshake.png';



const About = () => {
    const [activeButton, setActiveButton] = useState('I am an Employee');

    const handleFindCoachClick = () => {
        setActiveButton('I am an Employee');
    };

    const handleIAmCoachClick = () => {
        setActiveButton('I am a Coach');
    };

    return (
        <div className="about-container" id="about-section">
            <div>
                <h2>How It Works</h2>

                <div className="buttons">
                    <button
                        onClick={() => {
                            handleFindCoachClick();
                        }}
                        className={`find-coach-button ${activeButton === 'I am an Employee' ? 'active' : ''
                            }`}
                    >
                        I am an Employee
                    </button>
                    <button
                        onClick={() => {
                            handleIAmCoachClick();
                        }}
                        className={`i-am-coach-button ${activeButton === 'I am a Coach' ? 'active' : ''
                            }`}
                    >
                        I am a Coach
                    </button>
                </div>
                <div className="card-container">
                    {activeButton === 'I am an Employee' && (
                        <>
                            <div className="card">
                                <p>1. Create Your Profile</p>
                                <img src={createProfile} alt="create-profile" />
                                <h3>
                                    Sign Up to join the network of employees to find a coach
                                </h3>
                            </div>
                            <div className="card">
                                <p>2. Set Your Preferences</p>
                                <img src={preferences} alt="preferences" />
                                <h3>
                                    Let us know all about your development goals and learning
                                    preferences so that we can find you an appropriate coach
                                </h3>
                            </div>
                            <div className="card">
                                <p>3. Get Connected!</p>
                                <img src={handshake} alt="get-connected" />
                                <h3>
                                    Our matching algorithm will provide you with a list of the
                                    most compatible coaches for you to get in touch with!
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
                                    Sign Up to join the network of coaches looking to match to an
                                    employee
                                </h3>
                            </div>
                            <div className="card-coach">
                                <p>2. Set your Preferences</p>
                                <img src={preferences} alt="preferences" />
                                <h3>
                                    Let us know all about your development specialities,
                                    qualifications, and preferences so that we can find you an
                                    appropriate employee to coach
                                </h3>
                            </div>
                            <div className="card-coach">
                                <p>3. Get Connected!</p>
                                <img src={handshake} alt="get-connected" />
                                <h3>
                                    Our matching algorithm will provide you with a list of the
                                    most compatible employees for you to get in touch with!
                                </h3>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default About;
