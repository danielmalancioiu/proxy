const { getRecentAccessPattern } = require('./trackers/accessTracker')
const { getDataChangeRate } = require('./trackers/dataChangeTracker')
const { createRedisClient } = require('./redis-client')

async function calculateDynamicTTL(path) {
    const changeRate = await getDataChangeRate(path);
    const accessPattern = await getRecentAccessPattern(path);
    const frequency = accessPattern.length;
    console.log(frequency);
    const baseTTL = 300;  // Base TTL in seconds

    // Adjust TTL based on access frequency and data change rate
    if (changeRate > 0.1) {  // More sensitive to change rate
        return Math.max(baseTTL / 2, 60);  // Reduce TTL if data changes frequently
    } else if (frequency > 100) {  // High frequency of access
        return Math.min(baseTTL * 2, 600);  // Increase TTL for frequently accessed data
    } else if (accessPattern.includes('night')) {  // Lesser activity at night
        return baseTTL * 4;  // Increase TTL during low activity periods
    }
    return baseTTL;  // Default TTL
}

async function shouldResetTTL(accessCount, ttlLeft, threshold, minTTL) {
    // Check if accessed more frequently than 'threshold' times within the remaining TTL
    // and if the TTL is below a certain minimum threshold to avoid resetting too frequently
    return accessCount >= threshold && ttlLeft < minTTL
}

async function resetTTLIfNeeded(key, ttl, path) {
    const redisClient = createRedisClient()
    const frequency = (await getRecentAccessPattern(path)).length
    const ttlLeft = await redisClient.ttl(key)
    if (await shouldResetTTL(frequency, ttlLeft, 10, 300)) {
        // threshold = 10, minTTL = 5 minutes
        await redisClient.expire(key, ttl)
    }
}

module.exports = { calculateDynamicTTL, resetTTLIfNeeded }
