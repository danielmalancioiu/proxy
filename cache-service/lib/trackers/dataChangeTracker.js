const { createRedisClient } = require('../redis-client')
const client = createRedisClient()

client.on('error', (err) => console.error('Redis Client Error', err))

async function logDataChange(path) {
    const key = `data_change:${path}`
    const currentTime = Math.floor(Date.now() / 1000) // Current time in seconds
    await client.lPush(key, currentTime) // Push current time to list
    await client.lTrim(key, 0, 23) // Keep only last 24 entries
}

async function getDataChangeRate(path) {
    const key = `data_change:${path}`
    const timestamps = await client.lRange(key, 0, -1) // Get all timestamps

    if (timestamps.length < 2) {
        return 0 // Not enough data to calculate rate
    }

    const timeDiffs = timestamps
        .slice(1)
        .map((time, index) => timestamps[index] - time)
    const averageTimeDiff =
        timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length
    return 1 / averageTimeDiff // Change rate per second
}

module.exports = { logDataChange, getDataChangeRate }
