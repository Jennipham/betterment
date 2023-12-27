import React from 'react';
import Header from './header';
import Footer from './footer';
import Select from 'react-select';
import '../styles/MenteeMatches.css';

const customStyles = {
    control: (provided) => ({
        ...provided,
        borderRadius: '12px',
        border: 'none',
        backgroundColor: 'white', // Change the background color of the control
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
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        // Add more language options as needed
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

    return (
        <>
            <Header loggedIn={true} />

            <div className="mentee-profile-container">
                <div className="filter-section">
                    <Select
                        options={languageOptions}
                        placeholder="Language"
                        styles={customStyles}

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

                    <div className="user-profile">
                        <div className="profile-left">
                            <div className="profile-icon"> {/* Add your profile icon here */} </div>
                            <div className="user-info">
                                <p>User's Name</p>
                                <p>User's Job Role</p>
                                <p>User's Development Areas</p>
                            </div>
                            <div className="matching-info">
                                <p>Methods of Matching: ...</p>
                                <p>Location: ...</p>
                            </div>
                        </div>

                        <div className="matching-icon"> {/* Add your matching icon here */} </div>

                        <div className="mentor-profile">
                          <div className="profile-left">
                                    <div className="profile-icon"> {/* Add your profile icon here */} </div>
                                    <div className="user-info">
                                        <p>User's Name</p>
                                        <p>User's Job Role</p>
                                        <p>User's Development Areas</p>
                                    </div>
                                    <div className="matching-info">
                                        <p>Methods of Matching: ...</p>
                                        <p>Location: ...</p>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default MenteeMatches;
