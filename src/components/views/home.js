import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import { Link } from 'react-router-dom';
import Header from '../utils/header';
import TopSection from './topSection';
import ScrollToSection from '../utils/scrollToSection';
import About from './about';
import Faqs from './faqs';

function Home() {
    const [currentTargetPage, setCurrentTargetPage] = useState('about-section');
    const [hasScrolledToFaqs, setHasScrolledToFaqs] = useState(false);


    const updateTargetPage = () => {
        // Determine the next target page based on the current target page
        const nextTargetPage = currentTargetPage === 'about-section' ? 'faq-section' : 'about-section';

        // Update the target page
        setCurrentTargetPage(nextTargetPage);
    };

    useEffect(() => {
        const handleScroll = () => {
            const faqSection = document.getElementById('faq-section');
            if (faqSection) {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const faqSectionTop = faqSection.getBoundingClientRect().top + scrollTop;

                const scrollThreshold = faqSectionTop - window.innerHeight / 2;

                setHasScrolledToFaqs(scrollTop >= scrollThreshold);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [setHasScrolledToFaqs]);


    const faqData = [
        {
            question: "What is BetterMent?",
            answer: "BetterMent is an online platform that takes user profile information and matches employees to executive mentors within an organisation."
        },
        {
            question: "How does matching work?",
            answer: "Betterment provides 3 methods of matching. The first is random allocation. The second is manual matching where users can filter through and choose their match. The final method is the Betterment Algorithm which creates a similarity score between profiles for users to add their preferred matches to a shortlist. Users can order this shortlist in order of match preference and after 2 weeks this will be fed into the Gale-Shapely Algorithm where matches will be allocated."
        },
        {
            question: "How is the matching method picked?",
            answer: "Your manager will decide which matching method they would like for your organisation. If they have not chosen yet then this will default to Betterment's Algorithm."
        },
        {
            question: "What is Blind Matching?",
            answer: "Blind matching is an option provided which will hide the names on the profiles of potential matches to mitigate bias. Your manager will choose to have this setting on or off."
        },
        {
            question: "I've been matched, what now?",
            answer: "Congratulations! Once Betterment has found you a matc, you can choose to contact your match which will open up an email template for you to send to your mentor. You will also be notified to complete a user experience questionnaire. 2 weeks after you have been matched, your account will be automatically deleted."
        },
    ];

    return (

        <div>
            <Header />
            <TopSection id='top-section' />
            <div className="divider"></div>
            <div id='about-section'>
                <About />
            </div>
            <div className="divider"></div>
            <div id='faq-section'>
                <Faqs faqData={faqData} />
                <div className="center-button">
                    <Link to="/signup">
                        <button className="get-started">Get Started!</button>
                    </Link>
                </div>
            </div>

            <ScrollToSection
                text={'Find Out More'}
                targetPage={currentTargetPage}
                updateTargetPage={updateTargetPage}
                hideScroll={hasScrolledToFaqs}
            />
        </div>

    );
}

export default Home;
