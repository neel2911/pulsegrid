

const MAX_CPU_USAGE = 100 // 100%

const SERVERS = [{ id: 'node-server-1', totalMemory: 4000, status: "HEALTHY" }, { id: 'node-server-2', totalMemory: 8000, status: "HEALTHY" }, { id: 'node-server-3', totalMemory: 16000, status: "HEALTHY" }] as const

function generateRandom(maxNumber: number) {
    return Math.floor(Math.random() * maxNumber)
}


export function getLog() {
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

