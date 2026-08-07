import { useEffect, useState } from 'react'
import './App.css'


type ConnectionStatusType = "CONNECTING" | "CONNECTED" | "DISCONNECTED"

interface MetricPayload {
  serverId: string;
  timestamp: number;
  cpuUsage: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  status: 'HEALTHY' | "CRITICAL";
}

function App() {
  const [connectStatus, setConnectionStatus] = useState<ConnectionStatusType>('DISCONNECTED')
  const [serverLogs, setServerLogs] = useState<MetricPayload | null>(null)

  useEffect(() => {
    setConnectionStatus('CONNECTING')
    const ws = new WebSocket('ws://localhost:8080')
    ws.addEventListener('open', () => {
      setConnectionStatus('CONNECTED')
    })

    ws.addEventListener('close', () => {
      setConnectionStatus('DISCONNECTED')
    })

    ws.addEventListener('error', () => {
      setConnectionStatus('DISCONNECTED')
    })

    ws.addEventListener('message', (e) => {
      setServerLogs(JSON.parse(e.data))
    })



    return () => {
      ws.close()
    }
  }, [])

  return (
    <>
      {connectStatus}
      {JSON.stringify(serverLogs, null, 2)}
    </>
  )
}

export default App
