import logo from '../images/CCLogo.png'
import '../styles/Header.css';
import '../styles/font.css';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


const Header = ({loggedIn}) => {
    const location = useLocation();

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
                ) : loggedIn && location.pathname==='/profileSettings' ? ( //checks if logged in
                        <>
                            <RouterLink to="/help">Help</RouterLink>
                            <RouterLink to="/menteeProfile">Profile</RouterLink>
                            <RouterLink to="/">Log Out</RouterLink>

                        </>
                    ) : loggedIn && location.pathname === '/adminSettings' ? ( //checks if logged in
                            <>
                                <RouterLink to="/help">Help</RouterLink>
                                <RouterLink to="/dashboard">Insights</RouterLink>
                                <RouterLink to="/">Log Out</RouterLink>

                            </>
                        )
                    
                   : //not logged in and not on homepage (sign up/login pages)
                    
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
