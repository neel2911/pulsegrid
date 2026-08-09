import { WebSocketServer } from 'ws'
import { Redis } from 'ioredis'
import { CHANNEL, REDIS_URL } from './redis.js'
import { PORT } from './utils.js'

const wss = new WebSocketServer({ port: PORT })
const redis = new Redis(REDIS_URL)

redis.on('connect', () => {
    console.log('🟢 Gateway connected to Redis');
})

redis.on('error', (err) => {
    console.error('🔴 Gateway Redis Error:', err.message);
})


function startGateway() {
    console.log(`🚀 Gateway started on port ${PORT}...`)

    redis.subscribe(CHANNEL.serverMetrics, (err) => {
        if (err) {
            console.error('Failed to subscribe to Redis channel:', err)
        } else {
            console.log(`📡 Subscribed to Redis channel: ${CHANNEL.serverMetrics}`)
        }
    })

    redis.on('message', (channel, message) => {
        if (channel == CHANNEL.serverMetrics) {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message)
                }
            })
        }
    })


    wss.on('connection', (socket) => {
        console.log('⚡ New client connected to Gateway');
        socket.on('close', () => {
            console.log('🔌 Client disconnected from Gateway');
        })

        socket.on('error', (err) => {
            console.log(`Socket error: ${err.message}`);
        })

    })


}

startGateway()