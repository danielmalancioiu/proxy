/**
 * Fetches user profile data, simulating a database fetch operation.
 * @param {Object} params - Parameters passed to the function.
 * @returns {Object} User profile data.
 */
function main(params) {
    // Simulated database of user profiles
    const profiles = {
        "user1": { name: "John Doe", age: 30, email: "john.doe@example.com" },
        "user2": { name: "Jane Smith", age: 25, email: "jane.smith@example.com" }
    };

    const userId = params.userId || 'user1'; // Default to 'user1' if no ID provided
    const profile = profiles[userId];

    if (!profile) {
        return { error: 'User not found' };
    }

    return { result: profile };
}

exports.main = main;
