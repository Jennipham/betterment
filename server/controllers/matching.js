function galeShapley(menteePreferences, mentorPreferences, mentees, mentors) {
    const matches = {};
    let iterations = 0;
    const maxIterations = menteePreferences.length * 2;
    const matchedMentees = new Set(); // Keep track of matched mentees

    // Loop until all mentees are matched or maximum iterations reached
    while (Object.keys(matches).length < menteePreferences.length && iterations < maxIterations) {
        for (const mentee of menteePreferences) {
            if (!matchedMentees.has(mentee.email)) {
                // Get their next most preferred mentor
                const menteePreferredMentor = mentee.preferences.shift();
                if (!matches[menteePreferredMentor]) {
                    // Match if mentor is available
                    matches[menteePreferredMentor] = mentee.email;
                    matchedMentees.add(mentee.email);
                } 
                
                else {
                    // Considers Mentor Shortlist preferences
                    if (mentorPreferences[menteePreferredMentor] && mentors && mentees) {
                        const currentMenteeIndex = mentorPreferences[menteePreferredMentor].findIndex(email => email === matches[menteePreferredMentor]);
                        const potentialMenteeIndex = mentorPreferences[menteePreferredMentor].findIndex(email => email === mentee.email);

                        const currentMenteeProfile = mentees.find(m => m.email === matches[menteePreferredMentor]);
                        const potentialMenteeProfile = mentees.find(m => m.email === mentee.email);

                        if (currentMenteeProfile && potentialMenteeProfile) {
                            const isCurrentMenteeLessPreferred = currentMenteeProfile.profileInfo.declinedRequestsCount > 2 &&
                                potentialMenteeProfile.profileInfo.declinedRequestsCount < currentMenteeProfile.profileInfo.declinedRequestsCount;

                            if (isCurrentMenteeLessPreferred && potentialMenteeIndex < currentMenteeIndex) {
                                // Replace the current mentee with the new one if the new mentee is preferred
                                matchedMentees.delete(matches[menteePreferredMentor]);
                                matches[menteePreferredMentor] = mentee.email;
                                matchedMentees.add(mentee.email);
                            }
                        }
                    } else {
                        console.error('Mentor preferences or profiles are undefined.');
                    }
                }
            }
        }
        iterations++;
    }

    if (iterations >= maxIterations) {
        console.warn("Maximum iterations reached. Not all mentees may be matched.");
    }

    return matches; // Return the matched pairs
}

module.exports = galeShapley;

