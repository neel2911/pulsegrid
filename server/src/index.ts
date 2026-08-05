import { WebSocketServer } from 'ws';


const INTERVAL_TIME = 200

const MAX_CPU_USAGE = 100 // 100%

const wss = new WebSocketServer({ port: 8080 })

const SERVERS = [{ id: 'node-server-1', totalMemory: 4000, status: "HEALTHY" }, { id: 'node-server-2', totalMemory: 8000, status: "HEALTHY" }, { id: 'node-server-3', totalMemory: 16000, status: "HEALTHY" }] as const

function generateRandom(maxNumber: number) {
    return Math.floor(Math.random() * maxNumber)
}

function getLog() {
    const currentServerId = generateRandom(SERVERS.length)
    const currentServer = SERVERS[currentServerId]

    if (!currentServer) {
        throw new Error(`Invalid server index: ${currentServerId}`)
    }
    const serverId = currentServer.id
    const serverTotalMemory = currentServer.totalMemory
    const serverStatus = currentServer.status

    return {
        serverId,
        timestamp: new Date().getTime(),
        cpuUsage: Number(generateRandom(MAX_CPU_USAGE).toFixed(2)),
        memoryUsedMB: generateRandom(serverTotalMemory),
        memoryTotalMB: serverTotalMemory,
        status: serverStatus
    }
}



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

