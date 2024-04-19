const { createRedisClient } = require('../redis-client')

const client = createRedisClient()
client.on('error', (err) => console.error('Redis Client Error', err))

async function increaseAccessCount(path) {
    const key = `access_count:${path}`
    await client.incr(key) // Increment the count
    await client.expire(key, 3600) // Set expiration to 1 hour
}

async function getAccessFrequency(path) {
    const key = `access_count:${path}`
    const count = await client.get(key)
    return parseInt(count || 0) // Return the count or 0 if no data exists
}

module.exports = { increaseAccessCount, getAccessFrequency }
