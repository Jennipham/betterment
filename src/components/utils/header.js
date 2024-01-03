import logo from '../images/CCLogo.png'
import '../styles/Header.css';
import '../styles/font.css';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';



const Header = ({ loggedIn }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const userType = sessionStorage.getItem('userType');

    const [loggedInStatus, setLoggedInStatus] = useState(loggedIn);

    const handleLogout = async () => {
        try {
            // Call the server-side logout endpoint
            await axios.post('http://localhost:3001/logout');

            setLoggedInStatus(false);
            
            navigate.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
            // Handle logout failure
        }
    };

    return (
        <div className="header">
            <div className="logo">
                <RouterLink to="/">
                    <img src={logo} alt="BetterMent Logo" />
                </RouterLink>
            </div>
            <div className="nav-links">
                {location.pathname === '/' ? ( // Check if the user is on the home page
                    <>
                        <ScrollLink
                            to="about-section"
                            spy={true}
                            smooth={true}
                            offset={20}
                            duration={500}
                        >
                            About
                        </ScrollLink>
                        <ScrollLink
                            to="faq-section"
                            spy={true}
                            smooth={true}
                            offset={-10}
                            duration={500}
                        >
                            FAQs
                        </ScrollLink>
                        <RouterLink to="/signup">Sign Up</RouterLink>
                        <RouterLink to="/login">Login</RouterLink>
                    </>

                ) : loggedInStatus && location.pathname === '/profileSettings' ? ( //checks if logged in
                    <>
                        <RouterLink to="/help">Help</RouterLink>
                            {userType === 'mentee' ? (
                                <RouterLink to="/menteeProfile">Matching</RouterLink>
                            ) : userType === 'mentor' ? (
                                <RouterLink to="/mentorProfile">Matching</RouterLink>
                            ) : null}
                            <RouterLink to="/" onClick={handleLogout}>
                                Log Out
                            </RouterLink>

                    </>
                    ) : loggedInStatus && location.pathname === '/signupSuccess' ? ( //checks if logged in
                            <>
                                {userType === 'admin' ? (
                                    <RouterLink to="/managerSettings">Profile</RouterLink>
                                ) : (
                                    <RouterLink to="/profileSettings">Profile</RouterLink>
                                )}

                                {userType === 'mentee' ? (
                                    <RouterLink to="/menteeProfile">Matching</RouterLink>
                                ) : userType === 'mentor' ? (
                                    <RouterLink to="/mentorProfile">Matching</RouterLink>
                                ) : null}
                            <RouterLink to="/help">Help</RouterLink>
                            <RouterLink to="/" onClick={handleLogout}>
                                Log Out
                            </RouterLink>

                            </>
                        
                    )
                
                
                        : loggedInStatus && location.pathname === '/adminSettings' ? ( //checks if logged in
                    <>
                        <RouterLink to="/help">Help</RouterLink>
                        <RouterLink to="/dashboard">Insights</RouterLink>
                                    <RouterLink to="/" onClick={handleLogout}>
                                        Log Out
                                    </RouterLink>
                    </>


                ) : loggedInStatus && location.pathname === '/menteeProfile' || '/mentorProfile' ? ( //checks if logged in
                                <>
                        <RouterLink to="/profileSettings">Profile</RouterLink>
                        <RouterLink to="/help">Help</RouterLink>
                                        <RouterLink to="/" onClick={handleLogout}>
                                            Log Out
                                        </RouterLink>
                    </>
                )

                    :
                    
                    //not logged in and not on homepage (sign up/login pages)

                (<>

                    <RouterLink to="/">Home</RouterLink>
                    <RouterLink to="/signup">Sign Up</RouterLink>
                    <RouterLink to="/login">Login</RouterLink>


                </>
                )}
            </div>
        </div>
    );
};

export default Header;
