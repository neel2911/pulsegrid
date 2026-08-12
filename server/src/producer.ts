
import { Redis } from 'ioredis';
import { CHANNEL, REDIS_URL } from './redis.js';
import { getLog } from './utils.js'


const SPIKE_MODE = process.env.SPIKE_MODE === 'true';

const INTERVAL_TIME = SPIKE_MODE ? 5 : 200


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
        const rawLog = getLog();

        const payload = {
            type: 'METRIC_TICK',
            data: rawLog
        }

        const payloadString = JSON.stringify(payload)
        try {
            redis.publish(CHANNEL.serverMetrics, payloadString)
        } catch (err) {
            console.error('Failed to publish metric to Redis:', err)
        }
    }, INTERVAL_TIME)
}

startProducer()

