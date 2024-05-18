const { createRedisClient } = require('../redis-client');
const redisClient = createRedisClient();

async function logDataChange(path) {
    const timestamp = Date.now();
    const key = `dataChange:${path}`;
    
    // Add the timestamp to a sorted set with the timestamp as the score
    await redisClient.zAdd(key, [{ score: timestamp, value: timestamp.toString() }]);
    
    // Optionally, remove old entries to keep the dataset manageable
    const oneDayAgo = timestamp - 24 * 60 * 60 * 1000; // 24 hours ago
    await redisClient.zRemRangeByScore(key, 0, oneDayAgo);
}

async function getDataChangeRate(path) {
    const key = `dataChange:${path}`;
    const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hour ago

    // Get the count of changes in the last hour
    const changeCount = await redisClient.zCount(key, oneHourAgo, Date.now());
    
    // Calculate change rate (changes per minute)
    const changeRate = changeCount / 60;
    
    return changeRate;
}


module.exports = { logDataChange, getDataChangeRate }
