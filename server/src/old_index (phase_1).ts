import { WebSocketServer } from 'ws';
import { getLog } from './utils.js';

const wss = new WebSocketServer({ port: 8080 })

const INTERVAL_TIME = 200

wss.on('connection', (socket) => {
    console.log("Client Connected!");
    const timerId = setInterval(() => {
        socket.send(JSON.stringify(getLog()))
    }, INTERVAL_TIME)

    socket.on('close', () => {
        console.log('connection close')
        if (timerId) {
            clearInterval(timerId)
        }
    })

    socket.on('error', (err) => {
        console.log(err.cause)
        console.log(err.stack)
    })
})

