// Gale-Shapley algorithm for stable matching with sign-up date priority and declinedRequestsCount
function galeShapley(menteePreferences, mentorPreferences, mentees, mentors) {
    const matches = {};

    while (Object.keys(matches).length < menteePreferences.length) {
        for (const mentee of menteePreferences) {
            if (!matches[mentee.email]) {
                const menteePreferredMentor = mentee.preferences.shift();

                if (!matches[menteePreferredMentor]) {
                    // Mentor is not yet matched, match them
                    matches[menteePreferredMentor] = mentee.email;
                } else {
                    // Mentor is already matched, compare preferences, sign-up date, and declinedRequestsCount
                    const currentMentee = mentorPreferences[menteePreferredMentor].findIndex(email => email === matches[menteePreferredMentor]);
                    const potentialMentee = mentorPreferences[menteePreferredMentor].findIndex(email => email === mentee.email);

                    const currentMenteeProfile = mentors.find(m => m.email === matches[menteePreferredMentor]);
                    const potentialMenteeProfile = mentees.find(m => m.email === mentee.email);

                    const currentMenteeDeclinedCount = currentMenteeProfile.profileInfo.declinedRequestsCount || 0;
                    const potentialMenteeDeclinedCount = potentialMenteeProfile.profileInfo.declinedRequestsCount || 0;

                    if (
                        potentialMentee < currentMentee ||
                        (potentialMentee === currentMentee &&
                            (potentialMenteeProfile.signUpDate < currentMenteeProfile.signUpDate ||
                                potentialMenteeDeclinedCount < currentMenteeDeclinedCount))
                    ) {
                        // New mentee is preferred or has an earlier sign-up date or fewer declined requests, unmatch current mentee and match the new one
                        matches[menteePreferredMentor] = mentee.email;
                        delete matches[matches[menteePreferredMentor]];
                    }
                }
            }
        }
    }

    return matches;
}

module.exports = galeShapley;