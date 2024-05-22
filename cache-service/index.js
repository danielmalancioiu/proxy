
const express = require('express')
const { createRedisClient } = require('./lib/redis-client')
const {
    startFunctionUpdateScheduler,
    routeMappings,
} = require('./lib/scheduler')
const { ow } = require('./lib/openwhisk-client')
const {
    increaseAccessCount,
    getRecentAccessPattern,
} = require('./lib/trackers/accessTracker')
const {
    logDataChange,
    getDataChangeRate,
} = require('./lib/trackers/dataChangeTracker')
const cors = require('cors');

const app = express()
const redisClient = createRedisClient()


app.use(express.json());
// Enable CORS for all routes
app.use(cors());

// In-memory storage for function configurations
const functionConfigs = {};

app.get('/api/functions', (req, res) => {
    // Assuming routeMappings keys are in the form "/api/functionName"
    const functionNames = Object.keys(routeMappings).map((path) => {
        // Extract the function name part from the path
        return path.split('/').pop();  // This splits the path and returns the last element
    });
    res.json(functionNames);
});

// Function to register a new function with custom cache and TTL settings
app.post('/api/register', async (req, res) => {
    const { path, ttl, cacheable } = req.body;

    if (!path || typeof ttl !== 'number' || typeof cacheable !== 'boolean') {
        return res.status(400).send('Invalid registration parameters');
    }

    await redisClient.hSet('functionConfigs', path, JSON.stringify({ ttl, cacheable }));
    res.status(200).send('Function registered successfully');
});

// Function to retrieve settings for a given function
app.get('/api/settings', async (req, res) => {
    const { path } = req.query;

    if (!path) {
        return res.status(400).send('Path parameter is required');
    }

    const settings = await redisClient.hGet('functionConfigs', path);
    if (settings) {
        res.json(JSON.parse(settings));
    } else {
        res.json({ ttl: 300, cacheable: true }); // Default settings
    }
});

async function fetchAndCacheData(path, query, cacheKey, ttl) {
    const result = await ow.actions.invoke({
        name: routeMappings[path],
        blocking: true,
        result: true,
        params: query,
    });

    // Log data change when new data is fetched
    await logDataChange(path);

    // Cache the new result with a timestamp
    const cachedData = {
        timestamp: Date.now(),
        data: result
    };
    await redisClient.setEx(cacheKey, ttl, JSON.stringify(cachedData));

    return result;
}

async function calculateDynamicTTL(path, customTtl) {
    let baseTTL = Number(customTtl) || 300; // Default TTL of 5 minutes
    //const accessPattern = await getRecentAccessPattern(path);
    const frequency = await getRecentAccessPattern(path);
    const changeRate = await getDataChangeRate(path);
    const hour = new Date().getHours();

    console.log(frequency, changeRate, hour); // Debugging statement

    // Example: Increase TTL during peak hours (8 AM to 8 PM)
    if (hour >= 8 && hour <= 20) {
        baseTTL *= 2;
    }

    // Adjust TTL based on access frequency
    if (frequency > 100) {
        baseTTL *= 2; // Double TTL for high frequency access
    } else if (frequency < 10) {
        baseTTL /= 2; // Halve TTL for low frequency access
    }

    // Adjust TTL based on data change rate
    if (changeRate > 0.1) {
        baseTTL /= 2; // Halve TTL if data changes frequently
    }

    // Ensure TTL is within reasonable bounds
    return Math.max(60, Math.min(baseTTL, 3600)); // TTL between 1 minute and 1 hour
}



app.use(async (req, res) => {
    const { path, query } = req
    // Log each access to calculate frequency
    await increaseAccessCount(path)

    const cacheKey = `${path}?${JSON.stringify(query)}`
    const targetFunction = routeMappings[path]
    const settings = await redisClient.hGet('functionConfigs', path);
    const customConfig = settings ? JSON.parse(settings) : { ttl: 300, cacheable: true };
    const ttl = await calculateDynamicTTL(path, customConfig.ttl);

    let cacheable = customConfig.cacheable;
    if (typeof cacheable !== 'boolean') {
        cacheable = customConfig.cacheable === 'true';
    }
    console.log(`Cacheable for ${path}:`, cacheable); // Debugging statement

    if (targetFunction) {
        const cachedResult = await redisClient.get(cacheKey)
        if (cachedResult) {
            await redisClient.expire(cacheKey, ttl); // Update TTL on cache hit
            res.json({result: JSON.parse(cachedResult), cacheHit: true})
        } else {
            const result = await ow.actions.invoke({
                name: targetFunction,
                blocking: true,
                result: true,
                params: query,
            })

            if (cacheable) {
                await redisClient.setEx(cacheKey, ttl, JSON.stringify(result))
            }
            res.json({result: result, cacheHit: false})
        }
    } else {
        res.status(404).send('Not Found')
    }
})

const port = 3000
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
    startFunctionUpdateScheduler(30000) // 30 sec
})

module.exports = app


// const express = require('express');
// const axios = require('axios');
// const app = express();
// const PORT = 3000;

// app.use(express.json());

// // OpenWhisk API endpoint (used for forwarding non-invoke requests)
// const OPENWHISK_API = 'http://host.docker.internal:3233';

// app.all('*', (req, res) => {
//     // Check if the request is for action invocation
//     if (req.path.includes('/namespaces/') && req.method === 'POST' && req.path.includes('/actions/')) {
//         // This block handles invoke action requests
//         console.log('Invoke action request received');
//         console.log('Method:', req.method);
//         console.log('Path:', req.path);
//         console.log('Headers:', req.headers);
//         console.log('Body:', req.body);
        
//         // Respond with a message indicating the request has been logged
//         res.status(200).json({ message: 'Invoke action request logged' });
//     } else {
//         // This block forwards all other types of requests to the real OpenWhisk API
//         console.log('Forwarding request to OpenWhisk:', req.path);
//         axios({
//             method: req.method,
//             url: `${OPENWHISK_API}${req.path}`,
//             headers: {...req.headers, host: new URL(OPENWHISK_API).host}, // Adjust the 'host' header
//             data: req.body
//         })
//         .then(response => res.send(response.data))
//         .catch(error => res.status(error.response?.status || 500).json(error.response?.data || {error: 'Internal server error'}));
//     }
// });

// app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
