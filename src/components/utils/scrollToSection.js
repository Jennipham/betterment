import React, { useState } from 'react';
import '../styles/ScrollToSection.css';
import '../styles/font.css';
import chevronBlue from '../images/down-chevron-blue.svg';
import chevronWhite from '../images/down-chevron-white.svg';

const ScrollToSection = ({ text, targetPage, updateTargetPage, hideScroll }) => {
    const [isHovered, setIsHovered] = useState(false);

    const scrollToPage = () => {
        updateTargetPage(targetPage);

        const element = document.getElementById(targetPage);
        if (element) {
            const targetTop = element.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
    };

    return (
        <div
            className={`scroll-to-section ${isHovered ? 'hovered' : ''} ${hideScroll ? 'hidden' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={scrollToPage}
        >
            <span>{text}</span>
            <div className='down-image'>
                {isHovered ? <img src={chevronWhite} alt="Hover Chevron" /> : <img src={chevronBlue} alt="Down Chevron" />}
            </div>
        </div>
    );
};

export default ScrollToSection;
