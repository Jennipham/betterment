function galeShapley(menteePreferences, mentorPreferences, mentees, mentors) {
    const matches = {};

    // Loop until all mentees are matched
    while (Object.keys(matches).length < menteePreferences.length) {
        for (const mentee of menteePreferences) {
            // Check if the current mentee is not yet matched
            if (!matches[mentee.email]) {
                // Get the current mentee's most preferred mentor that hasn't been rejected yet
                const menteePreferredMentor = mentee.preferences.shift();

                // Check if the mentor is not yet matched
                if (!matches[menteePreferredMentor]) {
                    // If the mentor is available, make a match
                    matches[menteePreferredMentor] = mentee.email;
                } else {
                    // The comparison is based on: The mentor's preference order, Sign-up date of the mentees, Count of declined requests by the mentees.
                    const currentMenteeIndex = mentorPreferences[menteePreferredMentor].findIndex(email => email === matches[menteePreferredMentor]);
                    const potentialMenteeIndex = mentorPreferences[menteePreferredMentor].findIndex(email => email === mentee.email);

                    // Get profiles for comparison
                    const currentMenteeProfile = mentors.find(m => m.email === matches[menteePreferredMentor]);
                    const potentialMenteeProfile = mentees.find(m => m.email === mentee.email);

                    // Check if the new potential mentee is preferred based on sign-up date and declined requests count
                    const isNewMenteePreferred = (potentialMenteeIndex < currentMenteeIndex) ||
                        (potentialMenteeIndex === currentMenteeIndex &&
                            (potentialMenteeProfile.signUpDate < currentMenteeProfile.signUpDate ||
                                potentialMenteeProfile.profileInfo.declinedRequestsCount < currentMenteeProfile.profileInfo.declinedRequestsCount));

                    if (isNewMenteePreferred) {
                        // If the new mentee is preferred, update the match
                        matches[menteePreferredMentor] = mentee.email;
                    }
                }
            }
        }
    }

    return matches;
}

module.exports = galeShapley;
