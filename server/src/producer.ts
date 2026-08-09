
import { Redis } from 'ioredis';
import { CHANNEL, REDIS_URL } from './redis.js';
import { getLog } from './utils.js'

const INTERVAL_TIME = 200

const redis = new Redis(REDIS_URL);

redis.on('connect', () => {
    console.log('🟢 Producer connected to Redis');
})

redis.on('error', (err) => {
    console.error('🔴 Producer Redis Error:', err.message);
})


function startProducer() {
    console.log(`🚀 Metric Producer started. Emitting every ${INTERVAL_TIME}ms...`)
    setInterval(async () => {
        const payloadString = JSON.stringify(getLog())
        try {
            redis.publish(CHANNEL.serverMetrics, payloadString)
        } catch (err) {
            console.error('Failed to publish metric to Redis:', err)
        }
    }, INTERVAL_TIME)
}

startProducer()

