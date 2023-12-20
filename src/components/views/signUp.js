import React from 'react';
import axios from 'axios';
import '../styles/SignUp.css';
import { useNavigate } from 'react-router-dom';
import signUpEmployee from '../images/sign-up1.png';
import signUpCoach from '../images/sign-up2.png';

import Header from './header';
import { useState } from 'react';
import Footer from './footer';
import Loader from './loader';


const SignUp = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('');
    const [formData, setFormData] = useState({
        fname: '',
        sname: '',
        email: '',
        password: '',
    });

    const [confirmPassword, setConfirmPassword] = useState('');
   
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [userTypeErrorMessage, setUserTypeErrorMessage] = useState('');
    const [existingUserMessage, setExistingUserMessage] = useState('');
    const [emptyFieldErrorMessage, setEmptyFieldErrorMessage] = useState('');

    const [loading, setLoading] = useState(false);



    const handleUserType = (type) => {
        setUserType(type);
        setUserTypeErrorMessage('');
    };


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'password') {
            setFormData({
                ...formData,
                [name]: value,
            });
        } else if (name === 'confirmPassword') {
            setConfirmPassword(value);
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const checkEmailExists = async (email) => {
        try {
            const response = await axios.get('http://localhost:3001/check-email', {
                params: { email }, // Pass the email as a query parameter
            });

            return response.data.exists;
        } catch (error) {
            // Handle network or server errors
            setLoading(false);
            console.error('Error checking email:', error);
            return false;
        }
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        const emailExists = await checkEmailExists(formData.email);
        
        if (emailExists) {
            setLoading(false);

            setExistingUserMessage('This email is already registered');
            return;
        }

        
        if (formData.password !== confirmPassword) {
            setLoading(false);

            setPasswordErrorMessage('Passwords do not match');
            return;
        }

        if (userType === '') {
            setLoading(false);

            setUserTypeErrorMessage('Please indicate your profile type');
            return;
        }

        if (Object.values(formData).some((value) => value === '')) {
            setLoading(false);
            setEmptyFieldErrorMessage("Please fill in all fields");
            return;
        }
        
        try {
            setLoading(true);

            const { confirmPassword, ...dataToSend } = formData;
            dataToSend.userType = userType;
            const response = await axios.post('http://localhost:3001/signup', dataToSend); // Change the endpoint to match your server route
            if (response.status === 201) {
                const { token, firstName, lastName, userType, email, } = response.data;

                // Store the token in sessionStorage instead of localStorage
                sessionStorage.setItem('token', token);

                // Store user information in sessionStorage
                sessionStorage.setItem('firstName', firstName);
                sessionStorage.setItem('lastName', lastName);
                sessionStorage.setItem('userType', userType);
                sessionStorage.setItem('email', email);


                // Set the token in the Axios headers for subsequent requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                navigate("/signupSuccess", { state: { user: { fname: firstName, sname: lastName, userType: userType, email: email, } } })
            } else {
                setLoading(false);

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
                    {userType === 'mentee' ? (
                        <h7>Searching for a Mentor?</h7>
                    ) : userType === 'admin' ? (
                            <h7>Launching a mentoring program?</h7>
                    ) : (
                        <h7>Looking for a Mentee?</h7>
                    )}
                    <h8>Look no further with BetterMent!</h8>
                    {userType === 'mentee' ? (
                        <img src={signUpEmployee} alt="Find a Mentor" className="bottom" />
                    ) : userType === 'admin' ? (
                        <img src={signUpEmployee} alt="I am an Admin" className="bottom" />
                    ) : (
                        <img src={signUpCoach} alt="I am a Mentor" className="bottom" />
                    )}

            </div>
                <div className="right-section">

                    <h2>Sign Up</h2>
                    <h9>Please Select:</h9>
                    <div className="signButtons">
                        <button className="signUpbutton" onClick={() => handleUserType('mentee')}>Find a Mentor</button>
                        <button className="signUpbutton" onClick={() => handleUserType('mentor')}>I am a Mentor</button>
                        <button className="signUpbutton" onClick={() => handleUserType('admin')}>I am an Admin</button>

                    </div>
                    {userTypeErrorMessage && <p className="error-message">{userTypeErrorMessage}</p>}
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            <form className='form' onSubmit={handleSubmit} >
                                <div className="name-inputs">
                                    <input
                                        type="text"
                                        name="fname"
                                        placeholder="First Name"
                                        value={formData.fname}
                                        onChange={handleInputChange}
                                        className="half-width-input"
                                    />
                                    <input
                                        type="text"
                                        name="sname"
                                        placeholder="Surname"
                                        value={formData.sname}
                                        onChange={handleInputChange}
                                        className="half-width-input"
                                    />
                                </div>
                                <input
                                    className='input-field'
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />

                                {existingUserMessage && <p className="error-message">{existingUserMessage}</p>}
                                <input
                                    className='input-field'
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />

                                <input
                                    className='input-field'
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                />
                                {emptyFieldErrorMessage && <p className="error-message">{emptyFieldErrorMessage}</p>}
                                {passwordErrorMessage && <p className="error-message">{passwordErrorMessage}</p>}

                                <button className="submit" type="submit" onClick={handleSubmit}>
                                    Sign Up
                                </button>
                            </form>
                            <p>Already on BetterMent? <a href="/login" className='underline-login'>Log In</a></p>
                        </>
                    )}
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default SignUp;
