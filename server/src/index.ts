import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (socket) => {
    console.log("Client Connected!");


    socket.on('close', () => {
        console.log('connection close')
    })

    socket.on('error', (err) => {
        console.log(err.cause)
        console.log(err.stack)
    })
})

