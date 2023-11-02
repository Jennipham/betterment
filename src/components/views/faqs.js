import React, { useState, useEffect } from 'react';
import '../styles/Faqs.css';
import downChevron from '../images/down-chevron-white.svg';
import upChevron from '../images/up-chevron-white.svg';

const Faqs = ({ faqData }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        if (index === activeIndex) {
            setActiveIndex(null); // Close the accordion if it's already open
        } else {
            setActiveIndex(index); // Open the clicked accordion
        }
    };

    // Use useEffect to attach event listeners when the component mounts
    useEffect(() => {
        const faqHeaders = document.querySelectorAll('.faq-header');

        const toggleAnswer = (event) => {
            const faqItem = event.currentTarget.parentElement.parentElement;
            const answer = faqItem.querySelector('.faq-answer');

            if (answer) {
                if (answer.style.maxHeight) {
                    answer.style.maxHeight = null; // Hide the answer
                } else {
                    answer.style.maxHeight = answer.scrollHeight + 'px'; // Show the answer
                }
            }
        };

        faqHeaders.forEach((header) => {
            header.addEventListener('click', toggleAnswer);
        });

        // Cleanup: remove event listeners when the component unmounts
        return () => {
            faqHeaders.forEach((header) => {
                header.removeEventListener('click', toggleAnswer);
            });
        };
    }, []); // Empty dependency array ensures this effect runs only once, when the component mounts

    return (
        <div className="faq-container" id="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-items">
                {faqData.map((faq, index) => (
                    <div
                        key={index}
                        className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                    >
                        <div
                            className="faq-header"
                            onClick={() => toggleAccordion(index)}
                        >
                            <div className="faq-question">{faq.question}</div>
                            <div className="faq-chevron">
                                <img
                                    src={activeIndex === index ? upChevron : downChevron}
                                    alt="Dropdown Chevron"
                                />
                            </div>
                        </div>
                        {activeIndex === index && (
                            <div className="faq-answer">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Faqs;
