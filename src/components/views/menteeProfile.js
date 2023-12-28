import React from 'react';
import Header from './header';
import Footer from './footer';
import Select, { components } from 'react-select';
import '../styles/MenteeMatches.css';
import white from '../images/profile-white.png';
import black from '../images/profile-black.png';
import { useState } from 'react';



const customStyles = {
    control: (provided) => ({
        ...provided,
        borderRadius: '12px',
        border: 'none',
        backgroundColor: 'white', // Change the background color of the control
        fontFamily: 'agrandir wide light, sans- serif',
        fontWeight: 'bold',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'black', // Change the color of the placeholder text
    }),
    option: (provided) => ({
        ...provided,
        color: 'black', // Change the color of the dropdown options
    }),
};

const MenteeMatches = () => {

    const languageOptions = [
        { value: 'afrikaans', label: 'Afrikaans' },
        { value: 'english', label: 'English' },
        { value: 'french', label: 'French' },
        { value: 'german', label: 'German' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'hungarian', label: 'Hungarian' },
        { value: 'italian', label: 'Italian' },
        { value: 'marathi', label: 'Marathi' },
        { value: 'italian', label: 'Italian' },
        { value: 'portuguese', label: 'Portuguese' },
        { value: 'romanian', label: 'Romanian' },
        { value: 'spanish', label: 'Spanish' },
        { value: 'swedish', label: 'Swedish' },
        { value: 'turkish', label: 'Turkish' },
    ];

    const locationOptions = [
        { value: 'city1', label: 'City 1' },
        { value: 'city2', label: 'City 2' },
        // Add more location options as needed
    ];

    const developmentAreaOptions = [
        { value: 'frontend', label: 'Frontend' },
        { value: 'backend', label: 'Backend' },
        // Add more development area options as needed
    ];
    const CheckboxOption = ({ innerProps, label, isSelected, onChange }) => (
        <div {...innerProps}>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onChange(label)} // Handle checkbox change
            />
            {label}
        </div>
    );

    const customStylesWithCheckbox = {
        // ... your existing styles ...
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3BBED1' : 'white',
            color: state.isSelected ? 'white' : 'black',

        }),
    };
    const [selectedLanguages, setSelectedLanguages] = useState([]);

    const handleChange = (selectedOption) => {
        setSelectedLanguages(selectedOption);
        // You can perform additional actions with the selected options if needed
    };

    

    return (
        <>
            <Header loggedIn={true} />

            <div className="mentee-profile-container">
                <div className="filter-section">
                    <Select
                        options={languageOptions}
                        placeholder={selectedLanguages.length > 0 ? `Languages (${selectedLanguages.length})` : 'Languages'}
                        styles={{ ...customStyles, ...customStylesWithCheckbox }}
                        isMulti={true}
                        hideSelectedOptions={false}
                        controlShouldRenderValue={false}
                        components={{
                            Option: CheckboxOption,
                        }}
                        value={selectedLanguages}
                        onChange={handleChange}
                    />

                    <Select
                        options={locationOptions}
                        placeholder="Location"
                        styles={customStyles}

                    />

                    <Select
                        options={developmentAreaOptions}
                        placeholder="Development Area"
                        styles={customStyles}

                    />
                </div>
                <div className="match-section">
                    <h2 className='top-match'>Your Top Match:</h2>

                    <div className="user-profile-box">
                        <div className="profile-left">
                            <div className="profile-icon">
                                <img src={black} alt="Black Profile Icon" />
                            </div>
                            <div className="user-info">
                                <p>Name:</p>
                                <p>Job Role:</p>
                                <p>Development Areas:</p>
                            </div>
                            <div className="matching-info-left">
                                <p>Methods of Matching:</p>
                                <p>Location:</p>
                            </div>
                        </div>

                        <div className="matching-icon"> {/* Add your matching icon here */} </div>

                        <div className="mentor-profile-box">
                          <div className="profile-right">
                                <div className="profile-icon">
                                    <img src={white} alt="White Profile Icon" />
                                </div>
                                    <div className="match-info">
                                        <p>Name:</p>
                                        <p>Job Role:</p>
                                        <p>Development Areas:</p>
                                    </div>
                                    <div className="matching-info-right">
                                        <p>Methods of Matching:</p>
                                        <p>Location:</p>
                                    </div>
                                </div>
                        </div>
                    </div>
                    <button>See Other Matches</button>

                </div>
            </div>

            <Footer />
        </>
    );
};

export default MenteeMatches;
