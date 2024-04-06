import React from 'react';
import '../../styles/Terms.css';

const TermsOfUse = () => {

    return (
        <>
            <div className="terms-page">
                <h1 className="terms-message">Terms of Use</h1>
                <p className='terms-of-use-text'>
                    By accessing and using our website/service, you agree to comply with and be bound by the following terms and conditions. If you do not agree to these terms, please refrain from using our site.
                </p>
    
                <h2>1. Informed Consent</h2>
                <p>
                    By using the BetterMent platform, you agree to our Terms of Use and confirm that you have been informed about the nature of the services provided. You acknowledge that the platform is designed to facilitate executive mentoring and is not a substitute for professional counseling services.
                </p>
    
                <h2>2. Data Collection</h2>
                <p>
                    To provide an effective matching service, BetterMent collects personal profile data, including your name, job role, department, office location, preferred methods of mentoring, and areas for development. By creating a profile, you consent to this data collection.
                </p>
    
                <h2>3. Data Usage and Storage</h2>
                <p>
                    The data collected is used for creating your mentoring profile and is stored securely. It will be analyzed to enhance the effectiveness of the matching algorithms and improve your experience with the platform. BetterMent is committed to maintaining the confidentiality and security of your personal information.
                </p>
    
                <h2>4. Executive Mentoring vs. Counseling</h2>
                <p>
                    BetterMent is dedicated to executive mentoring, which is focused on professional growth and skill development within an organizational context. It is important to understand that executive mentoring through BetterMent is not equivalent to professional counseling, which addresses personal and psychological issues. Users seeking counseling should consult a qualified professional.
                </p>
    
                <h2>5. Matching Systems</h2>
                <p>
                    BetterMent offers three types of matching systems for users:
                </p>
                <ul className='methods-list'>
                    <li><strong>Random Matching:</strong> Matches are allocated randomly.</li>
                    <li><strong>Manual Matching:</strong> Users select their mentors or mentees based on personal preferences and profile information.</li>
                    <li><strong>BetterMent Algorithm:</strong> An intelligent, proprietary algorithm that considers user preferences, development needs, and user engagement to suggest the most suitable matches for effective mentoring relationships.</li>
                </ul>
                <p>Thank you for using BetterMent!</p>
            </div>
        </>
    );
}

export default TermsOfUse;
