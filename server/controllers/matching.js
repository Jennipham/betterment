function galeShapley(menteePreferences, mentorPreferences, mentees, mentors) {
    const matches = {};
    let iterations = 0;
    const maxIterations = menteePreferences.length * 2; // Maximum iterations to prevent infinite loop

    // Loop until all mentees are matched or maximum iterations reached
    while (Object.keys(matches).length < menteePreferences.length && iterations < maxIterations) {
        for (const mentee of menteePreferences) {
            if (!matches[mentee.email]) {
                const menteePreferredMentor = mentee.preferences.shift();
                if (!matches[menteePreferredMentor]) {
                    matches[menteePreferredMentor] = mentee.email;
                } else {
                    // Check if mentor preferences and profiles exist
                    if (mentorPreferences[menteePreferredMentor] && mentors && mentees) {
                        const currentMenteeIndex = mentorPreferences[menteePreferredMentor].findIndex(email => email === matches[menteePreferredMentor]);
                        const potentialMenteeIndex = mentorPreferences[menteePreferredMentor].findIndex(email => email === mentee.email);

                        const currentMenteeProfile = mentors.find(m => m.email === matches[menteePreferredMentor]);
                        const potentialMenteeProfile = mentees.find(m => m.email === mentee.email);

                        // Ensure profiles are found before accessing their properties
                        if (currentMenteeProfile && potentialMenteeProfile) {
                            const isNewMenteePreferred = (potentialMenteeIndex < currentMenteeIndex) ||
                                (potentialMenteeIndex === currentMenteeIndex &&
                                    (potentialMenteeProfile.profileInfo.declinedRequestsCount > 3 &&
                                        potentialMenteeProfile.profileInfo.declinedRequestsCount < currentMenteeProfile.profileInfo.declinedRequestsCount));

                            if (isNewMenteePreferred) {
                                matches[menteePreferredMentor] = mentee.email;
                            }
                        }
                    } else {
                        console.error('Mentor preferences or profiles are undefined.');
                    }
                }
            }
        }
        iterations++; // Increment the iteration count
    }

    if (iterations >= maxIterations) {
        console.warn("Maximum iterations reached. Not all mentees may be matched.");
    }

    return matches;
}

module.exports = galeShapley;
