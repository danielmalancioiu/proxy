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
    startFunctionUpdateScheduler(300000) // 5 minutes
})

module.exports = app
