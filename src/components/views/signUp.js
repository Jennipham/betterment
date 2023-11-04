import React from 'react';
import axios from 'axios';
import '../styles/SignUp.css';
import signUpEmployee from '../images/sign-up1.png';
import signUpCoach from '../images/sign-up2.png';


import Header from './header';
import { useState } from 'react';


const SignUp = () => {
    const [userType, setUserType] = useState('');
    const [formData, setFormData] = useState({
        fname: '',
        sname: '',
        email: '',
        password: '',
        userType: userType,
    });

    const handleUserType = (type) => {
        setUserType(type);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name !== 'confirmPassword') {

            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        try {
            const { confirmPassword, ...dataToSend } = formData;
            const response = await axios.post('http://localhost:3001/signup', dataToSend); // Change the endpoint to match your server route
            if (response.status === 200) {
                // Registration successful, you can redirect or show a success message
            } else {
                // Handle errors and display appropriate error feedback
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle network or server errors
        }
    };

    return (
        <div>
        <Header />
        <div className="sign-up-container">
                <div className="left-section">
                    {userType === 'find-a-coach' ? (
                        <h7>Searching for a Mentor?</h7>
                    ) : userType === 'i-am-an-admin' ? (
                            <h7>Launching a mentoring program?</h7>
                    ) : (
                        <h7>Looking for a Mentee?</h7>
                    )}
                    <h8>Look no further with BetterMent!</h8>
                    {userType === 'find-a-coach' ? (
                        <img src={signUpEmployee} alt="Find a Coach" className="bottom" />
                    ) : userType === 'i-am-an-admin' ? (
                        <img src={signUpEmployee} alt="I am an Admin" className="bottom" />
                    ) : (
                        <img src={signUpCoach} alt="I am a Coach" className="bottom" />
                    )}

            </div>
                <div className="right-section">
                    <h9>Please Select:</h9>
                <div className="signButtons">
                        <button className="signUpbutton" onClick={() => handleUserType('mentee')}>Find a Mentor</button>
                        <button className="signUpbutton" onClick={() => handleUserType('mentor')}>I am a Mentor</button>
                        <button className="signUpbutton" onClick={() => handleUserType('admin')}>I am an Admin</button>

                </div>
                <h2>Sign Up</h2>
                    <form className='form' onSubmit={handleSubmit} >
                        <input
                            type="text"
                            name="fname"
                            placeholder="First Name"
                            value={formData.fname}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="sname"
                            placeholder="Surname"
                            value={formData.sname}
                            onChange={handleInputChange}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            onChange={handleInputChange}
                        />
                        <button className="submit" type="submit" onClick={handleSubmit}>
                            Sign Up
                        </button>
                </form>
                <p>Already on BetterMent? <a href="/login">Log In</a></p>
            </div>
            </div>
        </div>
    );
};

export default SignUp;
