import React, { useEffect } from 'react';
import axios from 'axios'; // Make sure to import axios
import { useState } from 'react';

const AlgorithmMatch = () => {

    const userType = sessionStorage.getItem('userType');

    console.log(userType);

    const [potentialProfiles, setPotentialProfiles] = useState([]);

    const email = sessionStorage.getItem('email');

    const userAttributes = {

        jobRole: sessionStorage.getItem('jobRole') || '',
        officeLocation: sessionStorage.getItem('officeLocation') || '',
        developmentAreas: sessionStorage.getItem('developmentAreas') || '',
        mentoringMethods: sessionStorage.getItem('mentoringMethods') || '',
        languages: sessionStorage.getItem('languages') || [],
    };

    console.log(userAttributes.languages);

    // Matching function
    const matchUsers = async () => {
        try {

            // Retrieve mentor profiles
            const response = await axios.get('http://localhost:3001/getPotentialMatches', {
                params: {
                    userType: userType,
                    languages: userAttributes.languages,
                },
            });

            const profilesWithScores = response.data.profiles.map(profile => {
                const profileAttributes = profile.profileInfo;
                
                // Define weights for each attribute (you can adjust these values)
                const weights = {
                    jobRole: 3,
                    officeLocation: 2,
                    developmentAreas: 1,
                    mentoringMethods: 1,
                };

                // Calculate the weighted sum of attribute scores
                const totalScore =
                    weights.jobRole * calculateSimilarityScore(userAttributes.jobRole, profileAttributes.jobRole) +
                    weights.officeLocation * calculateSimilarityScore(userAttributes.officeLocation, profileAttributes.officeLocation) +
                    weights.developmentAreas * calculateSimilarityScore(userAttributes.developmentAreas, profileAttributes.developmentAreas) +
                    weights.mentoringMethods * calculateSimilarityScore(userAttributes.mentoringMethods, profileAttributes.mentoringMethods);

                return { ...profile, score: totalScore };
            });

            // Set the state with profiles and scores
            setPotentialProfiles(profilesWithScores);
        } catch (error) {
            console.error('Error fetching profiles:', error);
            // Handle error if necessary
        }
    };

    const calculateSimilarityScore = (str1, str2) => {
        // Implement your similarity calculation logic here
        // For example, you can use a library like string-similarity or implement your custom logic
        // Return a value between 0 and 1, where 1 means identical
        return 0.5; // Placeholder value, replace with actual implementation
    };

    // Call the matching function on component mount
    useEffect(() => {
        matchUsers();
    }, []); // Empty dependency array ensures the effect runs once on mount

    return (
        <div>
            {/* Access potentialProfiles state for rendering */}
            {potentialProfiles.map(profile => (
                <div key={profile.email}>
                    {/* Render profile details and similarity score */}
                    {profile.email} - Score: {profile.score} - Other profile details...
                </div>
            ))}
        </div>
    );
};

export default AlgorithmMatch;
