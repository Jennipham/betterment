import React from 'react';
import '../styles/Login.css';
import Header from './header';
// import { useState } from 'react';
import login from '../images/log-in.png'


const Login = () => {
    // const [userType, setUserType] = useState('');

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
                    <form className='form'>
                        <input type="email" placeholder="Email Address" />
                        <input type="password" placeholder="Password" />
                        <button className="submit" type="submit">Sign In</button>
                    </form>
                    <p>New to CoachConnect? <a href="/signup">Sign Up</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
