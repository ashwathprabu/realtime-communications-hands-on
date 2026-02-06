const { createClient } = require('redis')

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

const pubClient = createClient({ url: redisUrl })
const subClient = pubClient.duplicate()

pubClient.on('error', (err) => console.log('Redis Pub Client Error', err))
subClient.on('error', (err) => console.log('Redis Sub Client Error', err))

async function connectRedis() {
    await Promise.all([
        pubClient.connect(),
        subClient.connect()
    ])
    console.log('Redis connected')
}

module.exports = { pubClient, subClient, connectRedis }
