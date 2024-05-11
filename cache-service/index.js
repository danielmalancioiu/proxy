const express = require('express')
const { createRedisClient } = require('./lib/redis-client')
const {
    startFunctionUpdateScheduler,
    routeMappings,
} = require('./lib/scheduler')
const { ow } = require('./lib/openwhisk-client')
const {
    increaseAccessCount,
    getAccessFrequency,
} = require('./lib/trackers/accessTracker')
const {
    logDataChange,
    getDataChangeRate,
} = require('./lib/trackers/dataChangeTracker')
const { calculateDynamicTTL, resetTTLIfNeeded } = require('./lib/ttlCalculator')

const app = express()
const redisClient = createRedisClient()

app.use(async (req, res) => {
    const { path, query } = req
    // Log each access to calculate frequency
    await increaseAccessCount(path)

    const cacheKey = `${path}?${JSON.stringify(query)}`
    const targetFunction = routeMappings[path]
    const ttl = await calculateDynamicTTL(path)
    //const ttl = 300

    if (targetFunction) {
        const cachedResult = await redisClient.get(cacheKey)
        if (cachedResult) {
            await resetTTLIfNeeded(cacheKey, ttl, path)
            res.send(JSON.parse(cachedResult))
        } else {
            const result = await ow.actions.invoke({
                name: targetFunction,
                blocking: true,
                result: true,
                params: query,
            })

            await redisClient.setEx(cacheKey, ttl, JSON.stringify(result))
            res.send(result)
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
