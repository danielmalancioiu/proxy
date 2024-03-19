const express = require('express')
const openwhisk = require('openwhisk')
const NodeCache = require('node-cache')
const moment = require('moment')

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

// Create a cache with a default TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60 })
// Define an object to store the request counts for each resource
const requestCounts = {}

// Middleware to track access frequency
app.use((req, res, next) => {
    // Increment the request count for the current resource
    const resource = req.originalUrl
    requestCounts[resource] = (requestCounts[resource] || 0) + 1
    console.log(`Access frequency for ${resource}: ${requestCounts[resource]}`)
    next()
})

// Intercept incoming requests
app.use((req, res, next) => {
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
            // Adjust TTL
            adjustTTL(cacheKey)
        } else {
            // Forward request to OpenWhisk function
            ow.actions
                .invoke({
                    name: targetFunction,
                    blocking: true,
                    result: true,
                    params: req.query, // Pass query parameters as function parameters
                })
                .then((result) => {
                    // Cache the result with a dynamic TTL based on access frequency and volatility
                    const dynamicTTL = calculateDynamicTTL(cacheKey)
                    console.log(
                        `TTL from function for ${cacheKey}: ${dynamicTTL} seconds`
                    )
                    cache.set(cacheKey, result, dynamicTTL)
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

// Function to calculate dynamic TTL based on access frequency
function calculateDynamicTTL(resource) {
    // Define base TTL and adjust TTL based on access frequency
    const baseTTL = 60 // Default TTL of 60 seconds
    const accessFrequency = requestCounts[resource] || 0 // Get the access frequency for the current resource
    const adjustedTTLSeconds = baseTTL + accessFrequency * 5 // Increase TTL by 5 seconds for each access
    return adjustedTTLSeconds
}

// Adjust TTL based on cache hit frequency
function adjustTTL(key) {
    const currentTTL = cache.getTtl(key)
    if (currentTTL !== undefined) {
        const now = Date.now() // Current time in milliseconds
        const timeDifference = currentTTL - now
        const adjustedTTL = Math.max(timeDifference / 1000, 1) // Convert to seconds, ensure it doesn't go below 1 second
        cache.ttl(key, adjustedTTL - adjustTTL * 0.1) // Convert back to milliseconds before setting
        console.log(`Adjusted TTL for ${key}: ${adjustedTTL} seconds from now`)
    }
}
