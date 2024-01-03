import logo from '../images/CCLogo.png'
import '../styles/Header.css';
import '../styles/font.css';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';



const Header = ({ loggedIn }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState({
        firstName: sessionStorage.getItem('firstName') || 'User',
        lastName: sessionStorage.getItem('lastName') || '',
        userType: sessionStorage.getItem('userType') || '',
        email: sessionStorage.getItem('email') || '',
        jobRole: sessionStorage.getItem('jobRole') || '',
    });

    useEffect(() => {
        // Retrieve user information from sessionStorage
        const firstName = sessionStorage.getItem('firstName');
        const lastName = sessionStorage.getItem('lastName');
        const userType = sessionStorage.getItem('userType');
        const email = sessionStorage.getItem('email');
        const jobRole = sessionStorage.getItem('jobRole') || '';
        const officeLocation = sessionStorage.getItem('officeLocation') || '';
        const developmentAreas = sessionStorage.getItem('developmentAreas') || '';
        const mentoringMethods = sessionStorage.getItem('mentoringMethods') || '';
        const languages = sessionStorage.getItem('languages') || '';



        setUser({ firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
        console.log('User Information:', { firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
    }, []);

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
                            {user.userType === 'mentee' ? (
                                <RouterLink to="/menteeProfile">Matching</RouterLink>
                            ) : user.userType === 'mentor' ? (
                                <RouterLink to="/mentorProfile">Matching</RouterLink>
                            ) : null}
                            <RouterLink to="/help">Help</RouterLink>
                            <RouterLink to="/" onClick={handleLogout}>
                                Log Out
                            </RouterLink>

                    </>
                    ) : loggedInStatus && location.pathname === '/signupSuccess' ? ( //checks if logged in
                            <>
                                {user.userType === 'admin' ? (
                                    <RouterLink to="/managerSettings">Profile</RouterLink>
                                ) : (
                                        <RouterLink to={{
                                            pathname: "/profileSettings",
                                            state: {user: {userType: user.userType, email: user.email } } 
                                        }}>
                                            Profile
                                    </RouterLink>
                                )}

                                {user.userType === 'mentee' ? (
                                    <RouterLink to="/menteeProfile">Matching</RouterLink>
                                ) : user.userType === 'mentor' ? (
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


                            ) : loggedInStatus && (location.pathname === '/menteeProfile' || location.pathname === '/mentorProfile') ? ( //checks if logged in
                                <>
                                        <RouterLink to={{
                                            pathname: "/profileSettings",
                                            state: { user: { userType: user.userType, email: user.email } }
                                        }}>
                                            Profile
                                        </RouterLink>
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
