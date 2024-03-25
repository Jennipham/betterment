import React from 'react';
import top from '../../images/TopImage.png'
import '../../styles/Top.css';
import { useNavigate } from 'react-router-dom';


const TopSection = () => {

    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/signup');
      };

    return (
        <div className="top-section">
            <div className="text">
                <h1>Connecting Employees to Executive <span className='ment'>Ment</span>ors</h1>
                <h5>Project by: Jennifer Pham 2023</h5>
                <button className='get-started-button' onClick={handleButtonClick}>Get Started!</button>
            </div> 
            <div className="image">
                <img src= {top} alt="Top Section" />
            </div>

        </div>
    );
};
export default TopSection;
