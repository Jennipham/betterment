import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import { Link } from 'react-router-dom';
import Header from './header';
import TopSection from './topSection';
import ScrollToSection from './scrollToSection';
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

                // Determine the scroll threshold when you want to hide the ScrollToSection
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
            question: "What is Coach Connect?",
            answer: "Coach Connect is a platform that uses a machine learning to match employees with development coaches to help them reach their professional goals, overcome challenges, and maximize wellness. "
        },
        {
            question: "How do I get started?",
            answer: "To sign up as a coach, go to our registration page and fill out the necessary information."
        },
        {
            question: "How does the matching algorithm work?",
            answer: "The algorithm is..."
        },
        {
            question: "Why Development Coaching?",
            answer: "Development coaching..."
        },
        {
            question: "What Development Areas are available?",
            answer: "Areas available include..."
        },
    ];

    return (
        
            <div>
                <Header />
                <TopSection id='top-section' />
            <div id='about-section'>
                    <About />
                </div>
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
