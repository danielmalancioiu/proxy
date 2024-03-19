const express = require('express')
const openwhisk = require('openwhisk')
const NodeCache = require('node-cache')
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

// Create a cache with a TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60 })

// Intercept incoming requests
app.use((req, res, next) => {
    // Log all cached requests
    console.log('Cached requests:')
    cache.keys().forEach((key) => {
        console.log(key, cache.get(key))
    })
    // Extract routing information
    const { path, query } = req

    // Create a unique cache key based on request URL and parameters
    const cacheKey = `${path}?${JSON.stringify(query)}`

    // Apply routing logic
    const targetFunction = routeMappings[path]

    if (targetFunction) {
        // Check if the result is cached
        const cachedResult = cache.get(cacheKey)
        if (cachedResult) {
            // Return cached result
            res.send(cachedResult)
        } else {
            // Forward request to OpenWhisk function
            ow.actions
                .invoke({
                    name: targetFunction,
                    blocking: true,
                    result: true,
                    params: query,
                })
                .then((result) => {
                    // Cache the result
                    cache.set(cacheKey, result)
                    // Return function response to client
                    res.send(result)
                })
                .catch((err) => {
                    // Handle error
                    console.error('Function invocation error:', err)
                    res.status(500).send('Internal Server Error')
                })
        }
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
