import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import Header from './header';
import login from '../images/log-in.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();


    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3001/login', {
                email,
                password
            });

            if (response.data.loggedIn) {
                navigate("/signupSuccess")

            } else {
                setErrorMessage('Invalid email or password. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <div>
            <Header />
            <div className="sign-up-container">
                <div className="left-section">
                    <h10>Welcome Back</h10>
                    <h11>Lets get you Connected!</h11>
                    <img src={login} alt="login" className="bottom" />
                </div>
                <div className="right-section">
                    <h12>Login</h12>
                    <form className='form' onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="submit" type="submit">Sign In</button>
                    </form>
                    <p>New to BetterMent? <a href="/signup">Sign Up</a></p>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            </div>
        </div>
    );
};

export default Login;
