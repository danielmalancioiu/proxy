const { getAccessFrequency } = require('./trackers/accessTracker')
const { getDataChangeRate } = require('./trackers/dataChangeTracker')
const { createRedisClient } = require('./redis-client')

async function calculateDynamicTTL(path) {
    const frequency = await getAccessFrequency(path)
    const changeRate = await getDataChangeRate(path)
    const baseTTL = 300 // Base TTL in seconds

    if (changeRate > 0.5) {
        // High change rate
        return Math.max(baseTTL / 2, 60) // Shorter TTL, but not less than 60 seconds
    } else if (frequency < 10) {
        // Low access frequency
        return Math.min(baseTTL * 2, 3600) // Longer TTL, but not more than an hour
    }

    return baseTTL
}

async function shouldResetTTL(accessCount, ttlLeft, threshold, minTTL) {
    // Check if accessed more frequently than 'threshold' times within the remaining TTL
    // and if the TTL is below a certain minimum threshold to avoid resetting too frequently
    return accessCount >= threshold && ttlLeft < minTTL
}

async function resetTTLIfNeeded(key, ttl, path) {
    const redisClient = createRedisClient()
    const frequency = await getAccessFrequency(path)
    const ttlLeft = await redisClient.ttl(key)
    if (await shouldResetTTL(frequency, ttlLeft, 10, 300)) {
        // threshold = 10, minTTL = 5 minutes
        await redisClient.expire(key, ttl)
    }
}

module.exports = { calculateDynamicTTL, resetTTLIfNeeded }
