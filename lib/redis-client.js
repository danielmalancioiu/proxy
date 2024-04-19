const redis = require('redis')

function createRedisClient() {
    const client = redis.createClient({
        host: 'localhost',
        port: 6379,
    })
    client.on('error', (err) => console.error('Redis error', err))
    client.connect()

    return client
}

module.exports = { createRedisClient }
