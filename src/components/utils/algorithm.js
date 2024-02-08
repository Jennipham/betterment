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
        department: sessionStorage.getItem('department') || '',
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
                
                let totalScore =
                    calculateSimilarityScore(userAttributes.department, profileAttributes.profileInfo.department) +
                    calculateSimilarityScore(userAttributes.officeLocation, profileAttributes.profileInfo.officeLocation) +
                    calculateArraySimilarityScore(userAttributes.developmentAreas, profileAttributes.profileInfo.developmentAreas) +
                    calculateArraySimilarityScore(userAttributes.mentoringMethods, profileAttributes.profileInfo.mentoringMethods);

                    if (userType === 'mentee') {
                        totalScore += profileAttributes.level ? parseInt(profileAttributes.profileInfo.level) : 0;
                    }
        
                return { ...profile, score: totalScore };
            });

            const sortedProfiles = profilesWithScores.sort((a, b) => b.score - a.score);

            setPotentialProfiles(sortedProfiles);
            
        } catch (error) {
            console.error('Error fetching profiles:', error);
            // Handle error if necessary
        }
    };


    const calculateSimilarityScore = (str1, str2) => {
        // Use a case-insensitive comparison to check if the departments are the same
        return str1.toLowerCase() === str2.toLowerCase() ? 1 : 0;
    };

    const calculateArraySimilarityScore = (arr1, arr2) => {
        // Convert arrays to sets to handle uniqueness
        const set1 = new Set(arr1.map(item => item.toLowerCase()));
        const set2 = new Set(arr2.map(item => item.toLowerCase()));
    
        // Calculate the intersection of the two sets
        const intersection = new Set([...set1].filter(item => set2.has(item)));
    
        // Count the number of common elements
        const commonElementsCount = intersection.size;
    
        return commonElementsCount;
    };
    

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
