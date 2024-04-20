const redis = require('redis');

function createRedisClient() {
  //console.log('Connecting to Redis at:', process.env.REDIS_HOST, process.env.REDIS_PORT);

    // const client = redis.createClient({
    //     host: process.env.REDIS_HOST,
    //     port: process.env.REDIS_PORT 
    //   });
    const redisUrl = `redis://${process.env.REDIS_HOST}:6379`
    console.log('redisUrl:', redisUrl)
    const client = redis.createClient({ url: redisUrl });
    client.on('error', (err) => console.error('Redis error', err))
    client.connect()

    return client
}

module.exports = { createRedisClient };
