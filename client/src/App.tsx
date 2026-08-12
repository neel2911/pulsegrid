import { useEffect, useRef, useState } from 'react'
import { CpuChart } from './components/CpuChart';
import { VirtualizedLogTable } from './components/VirtualizedLogTable';



type ConnectionStatusType = "CONNECTING" | "CONNECTED" | "DISCONNECTED"

interface MetricPayload {
  serverId: string;
  timestamp: number;
  cpuUsage: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  status: 'HEALTHY' | "CRITICAL";
}

interface ServerMessage {
  type: 'METRIC_TICK';
  data: MetricPayload
}

function App() {
  const [connectStatus, setConnectionStatus] = useState<ConnectionStatusType>('DISCONNECTED')
  const [metricsHistory, setMetricsHistory] = useState<MetricPayload[]>([])
  const [latestServerMap, setLatestServerMap] = useState<Record<string, MetricPayload>>({});

  const bufferRef = useRef<MetricPayload[]>([]);

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
      try {
        const message: ServerMessage = JSON.parse(e.data)

        if (message.type == 'METRIC_TICK') {
          bufferRef.current.push(message.data)
        }
      } catch (err) {
        console.error('Failded to parse Websocket message:', err);
      }
    });

    const flushInterval = setInterval(() => {
      if (bufferRef.current.length === 0) return;

      const incomingBatch = [...bufferRef.current];
      bufferRef.current = [];

      setLatestServerMap((prev) => {
        const updateMap = { ...prev };
        incomingBatch.forEach(metric => {
          updateMap[metric.serverId] = metric;

        })
        return updateMap;
      })

      setMetricsHistory((prev) => {
        const updated = [...incomingBatch.reverse(), ...prev];
        return updated.slice(0, 1000);
      })
    }, 100)

    return () => {
      ws.close()
      clearInterval(flushInterval)
    }
  }, [])

  const activeServers = Object.values(latestServerMap)
  const serverCount = activeServers.length

  const avgCpu = serverCount > 0 ? (activeServers.reduce((acc, s) => acc + s.cpuUsage, 0) / serverCount).toFixed(1) : '0.0'
  const totalMemUsed = activeServers.reduce((acc, s) => acc + s.memoryUsedMB, 0)
  const totalMemMax = activeServers.reduce((acc, s) => acc + s.memoryTotalMB, 0)
  const memPercentage = totalMemMax > 0 ? ((totalMemUsed / totalMemMax) * 100).toFixed(1) : '0.0'

  const hasCriticalNode = activeServers.some((s) => s.status === 'CRITICAL');


  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pulsar Observability Engine</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time telemetry ingestion pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${connectStatus === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${connectStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {connectStatus}
          </span>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Nodes */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-400">Monitored Nodes</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{serverCount}</span>
            <span className="text-xs text-slate-500">Active</span>
          </div>
        </div>

        {/* Average CPU */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-400">Avg CPU Usage</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{avgCpu}%</span>
            <span className={`text-xs ${Number(avgCpu) > 80 ? 'text-rose-400' : 'text-slate-500'}`}>Across Cluster</span>
          </div>
        </div>

        {/* Cluster Memory */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-400">Cluster Memory</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{memPercentage}%</span>
            <span className="text-xs text-slate-500">{(totalMemUsed / 1024).toFixed(1)} GB / {(totalMemMax / 1024).toFixed(1)} GB</span>
          </div>
        </div>

        {/* Cluster Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-400">System Health</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${hasCriticalNode ? 'text-rose-400' : 'text-emerald-400'}`}>
              {hasCriticalNode ? 'CRITICAL' : 'HEALTHY'}
            </span>
            <span className="text-xs text-slate-500">Global State</span>
          </div>
        </div>
      </section>

      {/* Live CPU Area Chart */}
      <CpuChart metricsHistory={metricsHistory} />

      {/* Raw Telemetry Stream */}
      <VirtualizedLogTable metricsHistory={metricsHistory} />
    </div>
  )
}

export default App
