import React from 'react';
import '../styles/SignUp.css';
import signUpEmployee from '../images/sign-up1.png';
import signUpCoach from '../images/sign-up2.png'

import Header from './header';
import { useState } from 'react';


const SignUp = () => {
    const [userType, setUserType] = useState('find-a-coach');

    const handleUserType = (type) => {
        setUserType(type);
    };

    return (
        <div>
        <Header />
        <div className="sign-up-container">
                <div className="left-section">
                    {userType === 'find-a-coach' ? (
                        <h7>Searching for a Coach?</h7>) : (<h7>Looking for a Coachee?</h7>)} 
                <h8>Look no further with CoachConnect!</h8>
                    {userType === 'find-a-coach' ? (
                        <img src={signUpEmployee} alt="Find a Coach" className="bottom" />
                    ) : (
                        <img src={signUpCoach} alt="I am a Coach" className="bottom" />
                    )}
            </div>
                <div className="right-section">
                    <h9>Please Select:</h9>
                <div className="buttons">
                        <button onClick={() => handleUserType('find-a-coach')}>Find a Coach</button>
                        <button onClick={() => handleUserType('i-am-a-coach')}>I am a Coach</button>
                </div>
                <h2>Sign Up</h2>
                <form className='form'>
                    <input type="text" placeholder="Name" />
                    <input type="email" placeholder="Email Address" />
                    <input type="password" placeholder="Password" />
                    <input type="password" placeholder="Confirm Password" />
                    <button className="submit" type="submit">Sign Up</button>
                </form>
                <p>Already on CoachConnect? <a href="/login">Log In</a></p>
            </div>
            </div>
        </div>
    );
};

export default SignUp;
