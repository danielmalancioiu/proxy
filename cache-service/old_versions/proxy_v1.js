const express = require('express')
const openwhisk = require('openwhisk')

const app = express()
const ow = openwhisk({
    api_key:
        '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP',
    apihost: 'http://localhost:3233',
})

// Define routing rules
const routeMappings = {
    '/api/function1': '/guest/function1',
    '/api/function2': '/guest/function2',
}

// Intercept incoming requests
app.use((req, res, next) => {
    // Extract routing information
    const { path } = req

    // Apply routing logic
    const targetFunction = routeMappings[path]

    if (targetFunction) {
        // Forward request to OpenWhisk function
        ow.actions
            .invoke({
                name: targetFunction,
                blocking: true,
                result: true,
                params: req.query, // Pass query parameters as function parameters
            })
            .then((result) => {
                // Return function response to client
                res.send(result)
            })
            .catch((err) => {
                // Handle error
                console.error('Function invocation error:', err)
                res.status(500).send('Internal Server Error')
            })
    } else {
        // No matching route found
        res.status(404).send('Not Found')
    }
})

// Start the server
const port = 3000
app.listen(port, (err) => {
    if (err) {
        console.error('Server failed to start:', err)
    } else {
        console.log(`Server listening on port ${port}`)
    }
})
