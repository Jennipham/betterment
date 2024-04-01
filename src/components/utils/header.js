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
import { jwtDecode } from 'jwt-decode';


const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [loggedInStatus, setLoggedInStatus] = useState(false);
    const [notifications, setNotifications] = useState(0);

    const [receivedRequests, setReceivedRequests] = useState([]);
    const [isMatched, setIsMatched] = useState([]);

    const isAuthenticated = () => {
        const token = sessionStorage.getItem('token');

        if (!token) {
            setLoggedInStatus(false);
        }

        try {
            const decodedToken = jwtDecode(token);

            // Check if the token has expired
            const isTokenExpired = Date.now() >= decodedToken.exp * 1000;
            if
                (!isTokenExpired) { setLoggedInStatus(true); }// Return true if the token is not expired, otherwise false
            else {
                sessionStorage.clear();
                setLoggedInStatus(false);
                navigate('/expired', { replace: true });
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            setLoggedInStatus(false);
        }
    };

    const [user, setUser] = useState({
        firstName: sessionStorage.getItem('firstName') || 'User',
        lastName: sessionStorage.getItem('lastName') || '',
        userType: sessionStorage.getItem('userType') || '',
        email: sessionStorage.getItem('email') || '',
        jobRole: sessionStorage.getItem('jobRole') || '',
    });


    useEffect(() => {
        isAuthenticated();

        const tokenCheckInterval = setInterval(() => {
            isAuthenticated();
        }, 60000);

        return () => {
            clearInterval(tokenCheckInterval);
        };
    }, []);

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
        setUser({ firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
        // console.log('User Information:', { firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });

    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user.email || !user.userType) {
                    console.error('User information is missing.');
                    return;
                }

                if (user.userType === 'admin') {
                    return;
                }

                if (user.userType !== '') {
                    const userResponse = await axios.post('https://localhost:3001/getProfile', {
                        email: user.email,
                        userType: user.userType,
                    });

                    if (userResponse.data.match !== '') {
                        setIsMatched(true);
                    } else {
                        setIsMatched(false);
                    }
                }

                const receivedResponse = await axios.post('https://localhost:3001/getReceivedRequests', {
                    email: user.email,
                    userType: user.userType,
                });

                // Filter out declined requests
                const activeReceivedRequests = receivedResponse.data.receivedRequests.filter(req => !req.declined);
                setReceivedRequests(activeReceivedRequests);

                // Set notifications for non-declined requests only
                setNotifications(activeReceivedRequests.length > 0 ? 1 : 0);

            } catch (error) {
                console.error('Error fetching requests:', error);
            }
        };

        fetchData();
    }, [user.email, user.userType]);


    const handleLogout = async () => {
        try {
            await axios.post('https://localhost:3001/logout');
            sessionStorage.clear();

            setTimeout(() => {
                setLoggedInStatus(false);
                navigate("/", { replace: true })
            }, 500);
        } catch (error) {
            console.error('Logout failed:', error);
            sessionStorage.clear();

            setTimeout(() => {
                setLoggedInStatus(false);
                navigate("/", { replace: true })
            }, 500);

        }
    };

    return (
        <div className="header">
            <div className="logo">
                {loggedInStatus ? (
                    user.userType === 'admin' ? (
                        <RouterLink
                            to={{
                                pathname: "/adminSettings",
                                state: { user: { userType: user.userType, email: user.email } }
                            }}
                        >
                            <img src={logo} alt="BetterMent Logo" />
                        </RouterLink>) : (
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
                        {notifications < 1 ?
                            <RouterLink to="/requests">
                                <img className='notification-icon-header' src={notification} alt="Requests" />
                            </RouterLink> :
                            <RouterLink to="/requests">
                                <img className='notification-exclamation-icon-header' src={notificationExclamation} alt="Requests" />
                            </RouterLink>
                        }
                        {user.userType === 'mentee' ? (
                            <RouterLink to="/menteematches">Matching</RouterLink>
                        ) : user.userType === 'mentor' ? (
                            <RouterLink to="/mentormatches">Matching</RouterLink>
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
                                <RouterLink to="/adminSettings">Profile</RouterLink>
                            ) : (
                                <RouterLink to={{
                                    pathname: "/profileSettings",
                                    state: { user: { userType: user.userType, email: user.email } }
                                }}>
                                    Profile
                                </RouterLink>
                            )}
                            {user.userType === 'mentee' ? (
                                <RouterLink to="/menteematches">Matching</RouterLink>
                            ) : user.userType === 'mentor' ? (
                                <RouterLink to="/mentormatches">Matching</RouterLink>
                            ) : null}
                            <RouterLink to="/help">Help</RouterLink>
                            <RouterLink to="/" onClick={handleLogout}>
                                Log Out
                            </RouterLink>

                        </>
                    )
                        : loggedInStatus && location.pathname === '/help' ? ( //checks if logged in
                            <>
                                {user.userType !== "admin" ? (
                                    <RouterLink to="/requests">
                                        <img className='notification-icon-header' src={notifications < 1 ? notification : notificationExclamation} alt="Requests" />
                                    </RouterLink>
                                ) : null}
                                {user.userType === 'admin' ? (
                                    <RouterLink to="/adminSettings">Profile</RouterLink>
                                ) : (
                                    <RouterLink to={{
                                        pathname: "/profileSettings",
                                        state: { user: { userType: user.userType, email: user.email } }
                                    }}>
                                        Profile
                                    </RouterLink>
                                )}
                                {user.userType === 'mentee' ? (
                                    <RouterLink to="/menteematches">Matching</RouterLink>
                                ) : user.userType === 'mentor' ? (
                                    <RouterLink to="/mentormatches">Matching</RouterLink>
                                ) : <RouterLink to="/dashboard">Insights</RouterLink>}
                                {/* <RouterLink to="/help">Help</RouterLink> */}
                                <RouterLink to="/" onClick={handleLogout}>
                                    Log Out
                                </RouterLink>

                            </>
                        )


                            : loggedInStatus && location.pathname === '/signupSuccess' ? ( //checks if logged in
                                <>
                                    {user.userType === 'admin' ? (
                                        <RouterLink to="/adminSettings">Profile</RouterLink>
                                    ) : (
                                        <RouterLink to={{
                                            pathname: "/profileSettings",
                                            state: { user: { userType: user.userType, email: user.email } }
                                        }}>
                                            Profile
                                        </RouterLink>
                                    )}

                                    {user.userType === 'mentee' ? (
                                        <RouterLink to="/menteematches">Matching</RouterLink>
                                    ) : user.userType === 'mentor' ? (
                                        <RouterLink to="/mentormatches">Matching</RouterLink>
                                    ) : null}
                                    <RouterLink to="/help">Help</RouterLink>
                                    <RouterLink to="/" onClick={handleLogout}>
                                        Log Out
                                    </RouterLink>

                                </>

                            )


                                : loggedInStatus && location.pathname === '/adminSettings' ? ( //checks if logged in
                                    <>
                                        <RouterLink to="/dashboard">Insights</RouterLink>
                                        <RouterLink to="/help">Help</RouterLink>

                                        <RouterLink to="/" onClick={handleLogout}>
                                            Log Out
                                        </RouterLink>
                                    </>


                                )
                                    : loggedInStatus && location.pathname === '/dashboard' ? ( //checks if logged in
                                        <>
                                            <RouterLink to="/adminSettings">Profile</RouterLink>
                                            <RouterLink to="/help">Help</RouterLink>
                                            <RouterLink to="/" onClick={handleLogout}>
                                                Log Out
                                            </RouterLink>
                                        </>


                                    )


                                        : loggedInStatus && (location.pathname === '/menteematches' || location.pathname === '/mentormatches') ? ( //checks if logged in
                                            <>
                                                {notifications < 1 ?
                                                    <RouterLink to="/requests">
                                                        <img className='notification-icon-header' src={notification} alt="Requests" />
                                                    </RouterLink> :
                                                    <RouterLink to="/requests">
                                                        <img className='notification-exclamation-icon-header' src={notificationExclamation} alt="Requests" />
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
