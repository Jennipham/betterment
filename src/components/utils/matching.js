// Function to calculate weighted Euclidean distance
function calculateWeightedEuclideanDistance(mentee, mentor, featureWeights) {
    const sharedFeatures = Object.keys(mentee).filter(feature => feature in mentor);

    const distance = Math.sqrt(
        sharedFeatures.reduce((sum, feature) => {
            const weight = featureWeights[feature] || 1; // Default weight to 1 if not specified
            return sum + weight * Math.pow(mentee[feature] - mentor[feature], 2);
        }, 0)
    );

    return distance;
}

// Function to find K-nearest mentors
async function findKNearestNeighbors(featureWeights, k) {
    // Retrieve mentee profile from sessionStorage
    const menteeProfileString = sessionStorage.getItem('profile');
    const menteeProfile = JSON.parse(menteeProfileString);

    // Fetch mentor profiles from the API
    const response = await axios.get('/http://localhost:3001/getMentors'); // Replace with your API endpoint
    const mentorProfiles = response.data;

    // Calculate distances and find K-nearest mentors
    const distances = mentorProfiles.map(mentor => ({
        mentorId: mentor._id,
        distance: calculateWeightedEuclideanDistance(menteeProfile, mentor.profileInfo, featureWeights),
    }));

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
}

// Example usage
const featureWeights = {
    jobRole: 1,
    department: 1,
    officeLocation: 1,
    capacity: 1,
    languages: 3,
    developmentAreas: 2,
    mentoringMethods: 3,
};

const k = 3; // Number of nearest neighbors to consider

// Call the function and handle the result (it's an async operation)
findKNearestNeighbors(featureWeights, k)
    .then(nearestNeighbors => {
        console.log('Nearest Neighbors:', nearestNeighbors);
    })
    .catch(error => {
        console.error('Error fetching mentor profiles:', error);
    });