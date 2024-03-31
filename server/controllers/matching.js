function galeShapley(menteePreferences, mentorPreferences, mentees, mentors) {
    const matches = {};
    let iterations = 0;
    const maxIterations = menteePreferences.length * 2;

    // Loop until all mentees are matched or maximum iterations reached
    while (Object.keys(matches).length < menteePreferences.length && iterations < maxIterations) {
        for (const mentee of menteePreferences) {
            if (!matches[mentee.email]) {
                // Get their most preferred, available mentor
                const menteePreferredMentor = mentee.preferences.shift();
                if (!matches[menteePreferredMentor]) {
                    matches[menteePreferredMentor] = mentee.email; // Match the mentee with the mentor
                } else {
                    // Considers Mentor Shortlist preferences
                    if (mentorPreferences[menteePreferredMentor] && mentors && mentees) {
                        const currentMenteeIndex = mentorPreferences[menteePreferredMentor].findIndex(email => email === matches[menteePreferredMentor]);
                        const potentialMenteeIndex = mentorPreferences[menteePreferredMentor].findIndex(email => email === mentee.email);

                        const currentMenteeProfile = mentors.find(m => m.email === matches[menteePreferredMentor]);
                        const potentialMenteeProfile = mentees.find(m => m.email === mentee.email);

                        // Prioritise mentees with a lower declinedRequests count
                        if (currentMenteeProfile && potentialMenteeProfile) {
                            const isNewMenteePreferred = (potentialMenteeIndex < currentMenteeIndex) &&
                            (
                                currentMenteeProfile.profileInfo.declinedRequestsCount <= 3 &&
                                potentialMenteeProfile.profileInfo.declinedRequestsCount > currentMenteeProfile.profileInfo.declinedRequestsCount);                    

                            if (isNewMenteePreferred) { // If the new mentee is preferred over the current one
                                matches[menteePreferredMentor] = mentee.email; // Replace the current mentee with the new one
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