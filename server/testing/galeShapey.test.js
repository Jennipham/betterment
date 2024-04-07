const galeShapley = require('../controllers/matching');

describe('galeShapley function', () => {
  test('should correctly match mentees to mentors, considering declined requests', () => {
    // Mock data for mentee and mentor preferences
    const menteePreferences = [
      { email: 'mentee1@example.com', preferences: ['mentor1@example.com', 'mentor2@example.com'], declinedRequestsCount: 5 },
      { email: 'mentee2@example.com', preferences: ['mentor1@example.com', 'mentor2@example.com'], declinedRequestsCount: 1 },
    ];
    const mentorPreferences = {
      'mentor1@example.com': ['mentee2@example.com', 'mentee1@example.com'],
      'mentor2@example.com': ['mentee1@example.com', 'mentee2@example.com'],
    };

    // Mock data for mentee and mentor profiles
    const mentees = [
      { email: 'mentee1@example.com', profileInfo: { declinedRequestsCount: 5 } },
      { email: 'mentee2@example.com', profileInfo: { declinedRequestsCount: 1 } },
    ];
    const mentors = [
      { email: 'mentor1@example.com', profileInfo: { declinedRequestsCount: 1 } },
      { email: 'mentor2@example.com', profileInfo: { declinedRequestsCount: 1 } },
    ];

    const matches = galeShapley(menteePreferences, mentorPreferences, mentees, mentors);

    // Expected matches
    const expectedMatches = {
      'mentor1@example.com': 'mentee2@example.com',
      'mentor2@example.com': 'mentee1@example.com',
    };
    console.log('Expected Matches:', expectedMatches);
    console.log('Actual Matches:', matches);

    expect(matches).toEqual(expectedMatches);
  });

});
