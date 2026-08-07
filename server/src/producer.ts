import { Redis } from 'ioredis'
import { getLog } from './utils.js'

const INTERVAL_TIME = 200
const CHANNEL = {
    serverMetrics: 'server-metrics'
}
function producer() {
    const redis = new Redis('redis://localhost:6379');
    setInterval(() => {
        const payloadString = JSON.stringify(getLog())
        redis.publish(CHANNEL.serverMetrics, payloadString)
    }, INTERVAL_TIME)




}

producer()

