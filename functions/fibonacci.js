function main(params) {
    // Parse the input parameter 'n' and convert it to an integer
    const n = parseInt(params.n);
    if (isNaN(n) || n < 0) {
        // Return an error message if 'n' is not a valid positive integer
        return { error: "Invalid input: 'n' must be a non-negative integer." };
    }

    // Call the Fibonacci function with memoization
    const result = fibonacci(n);

    // Return the result in the expected format
    return { fibonacci: result };
}

function fibonacci(num, memo = {}) {
    // Base cases: Fibonacci of 0 or 1
    if (num <= 1) return 1;

    // Check if the result is already computed and stored in memo
    if (num in memo) return memo[num];

    // Recursively calculate Fibonacci using memoization
    memo[num] = fibonacci(num - 1, memo) + fibonacci(num - 2, memo);
    return memo[num];
}
