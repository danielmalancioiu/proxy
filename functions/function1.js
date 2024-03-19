function main(args) {
    // Check if parameters exist and are numeric
    const param1 = parseInt(args.param1)
    const param2 = parseInt(args.param2)

    // Check if parameters are valid numbers
    if (isNaN(param1) || isNaN(param2)) {
        return {
            message:
                'Invalid parameters. Please provide numeric values for param1 and param2.',
        }
    }

    // Perform the multiplication
    const result = param1 * param2

    // Return the result along with a message
    return {
        message: `Function 1 was invoked with parameters ${param1} and ${param2}. Result is ${result}.`,
    }
}
