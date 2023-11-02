import React from 'react';
import top from '../images/TopImage.png'
import '../styles/Top.css';

const TopSection = () => {

    return (
        <div className="top-section">
            <div className="text">
                <h1>Connecting Employees to Development Coaches</h1>
                <h5>Project by: Jennifer Pham 2023</h5>

            </div> 
            <div className="image">
                <img src= {top} alt="Top Section" />
            </div>
            <div className="top-section">

            </div>
        </div>
    );
};
export default TopSection;
