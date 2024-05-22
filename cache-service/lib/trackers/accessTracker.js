const { createRedisClient } = require('../redis-client');

const client = createRedisClient();
client.on('error', (err) => console.error('Redis Client Error', err));

const MAX_LOG_ENTRIES = 50;  // Limit the number of timestamps to keep

async function increaseAccessCount(path) {
    const keyLog = `access_log:${path}`;
    const timestamp = Date.now().toString()
    await client.lPush(keyLog, timestamp);  // Push new timestamp to the list
    await client.lTrim(keyLog, 0, MAX_LOG_ENTRIES - 1);  // Trim the list to the last 50 entries
    await client.expire(keyLog, 3600);  // Set expiration to 1 hour
}

async function getAccessFrequency(path) {
    const key = `access_count:${path}`
    const count = await client.get(key)
    return parseInt(count || 0) // Return the count or 0 if no data exists
}

async function getRecentAccessPattern(path) {
    const key = `access_log:${path}`;
    const timestamps = await client.lRange(key, 0, -1);  // Retrieve all timestamps

    return timestamps.length;
}
//     if (timestamps.length === 0) {
//         return 'low';
//     }

//     const lastTimestamp = parseInt(timestamps[0]);
//     const lastDate = new Date(lastTimestamp);
//     const hours = lastDate.getHours();

//     // Determine pattern based on the time of the last access
//     if (hours >= 8 && hours <= 18) {
//         return 'day';
//     } else {
//         return 'night';
//     }
// }

module.exports = { increaseAccessCount, getRecentAccessPattern };
