import logo from '../images/CCLogo.png'
import '../styles/Header.css';
import '../styles/font.css';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import notification from '../images/notification-icon.png';
import notificationExclamation from '../images/notification-exclamation.png';
import { use } from 'bcrypt/promises';



const Header = ({ loggedIn }) => {
    const location = useLocation();
    const navigate = useNavigate();


    const [loggedInStatus, setLoggedInStatus] = useState(loggedIn);
    const [notifications, setNotifications] = useState(0);


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
        
        const profileString = sessionStorage.getItem('profile');
        const profile = JSON.parse(profileString);
        
        setUser({ firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
        console.log('User Information:', { firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
   
        const receivedRequestsLength = Array.isArray(profile?.receivedRequests)
            ? profile?.receivedRequests.length
            : 0;

        setNotifications(receivedRequestsLength);
        console.log('profile', profile);


        console.log('notification count', notifications);
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3001/logout');
            sessionStorage.clear();

            setTimeout(() => {
                setLoggedInStatus(false);
                navigate("/", { replace: true })
            }, 500);
        } catch (error) {
            console.error('Logout failed:', error);

        }
    };

    return (
        <div className="header">
            <div className="logo">
                {loggedInStatus ? (
                    user.userType === 'admin' ? (
                        <RouterLink to="/managerSettings">Profile</RouterLink>
                    ) : (
                        <RouterLink
                            to={{
                                pathname: "/profileSettings",
                                state: { user: { userType: user.userType, email: user.email } }
                            }}
                            >
                                <img src={logo} alt="BetterMent Logo" />
                        </RouterLink>
                    )
                ) : (
                    <RouterLink to="/">
                        <img src={logo} alt="BetterMent Logo" />
                    </RouterLink>
                )}

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
                            {notifications === 0 ?
                                <RouterLink to="/requests">
                                    <img className='notification-icon-header' src={notification} alt="Requests" />
                                </RouterLink> :
                                <RouterLink to="/requests">
                                    <img className='notification-icon-header' src={notificationExclamation} alt="Requests" />
                                </RouterLink>
                            }
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
                         : loggedInStatus && location.pathname === '/requests' ? ( //checks if logged in
                <>
                                {user.userType === 'admin' ? (
                                    <RouterLink to="/managerSettings">Profile</RouterLink>
                                ) : (
                                    <RouterLink to={{
                                        pathname: "/profileSettings",
                                        state: { user: { userType: user.userType, email: user.email } }
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
                        : loggedInStatus && location.pathname === '/help' ? ( //checks if logged in
                            <>
                                {notifications === 0 ?
                                    <RouterLink to="/requests">
                                        <img className='notification-icon-header' src={notification} alt="Requests" />
                                    </RouterLink> :
                                    <RouterLink to="/requests">
                                        <img className='notification-icon-header' src={notificationExclamation} alt="Requests" />
                                    </RouterLink>
                                }
                                {user.userType === 'admin' ? (
                                    <RouterLink to="/managerSettings">Profile</RouterLink>
                                ) : (
                                    <RouterLink to={{
                                        pathname: "/profileSettings",
                                        state: { user: { userType: user.userType, email: user.email } }
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
                        
                        
                        : loggedInStatus && location.pathname === '/signupSuccess' ? ( //checks if logged in
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
                                        {notifications === 0 ?
                                            <RouterLink to="/requests">
                                                <img className='notification-icon-header' src={notification} alt="Requests" />
                                            </RouterLink> :
                                            <RouterLink to="/requests">
                                                <img className='notification-icon-header' src={notificationExclamation} alt="Requests" />
                                            </RouterLink>
                                        }
                                        
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
