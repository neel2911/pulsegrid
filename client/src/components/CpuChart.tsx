import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricPayload {
    serverId: string;
    timestamp: number;
    cpuUsage: number;
    memoryUsedMB: number;
    memoryTotalMB: number;
    status: 'HEALTHY' | 'CRITICAL';
}

interface CpuChartProps {
    metricsHistory: MetricPayload[];
}

export function CpuChart({ metricsHistory }: CpuChartProps) {
    // Aggregate data by timestamp for chronological rendering (oldest -> newest)
    const chartData = [...metricsHistory]
        .reverse()
        .slice(-30) // Display last 30 ticks
        .map((metric) => ({
            time: new Date(metric.timestamp).toLocaleTimeString([], {
                hour12: false,
                minute: '2-digit',
                second: '2-digit',
            }),
            cpu: metric.cpuUsage,
            serverId: metric.serverId,
        }));

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-white">Cluster CPU Telemetry</h2>
                    <p className="text-xs text-slate-400">Live CPU utilization across rolling window</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-xs text-slate-400 font-mono">CPU %</span>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                        <YAxis domain={[0, 100]} stroke="#475569" fontSize={11} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                            itemStyle={{ color: '#818cf8', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="cpu"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#cpuGradient)"
                            isAnimationActive={false} // Disable CSS animations for high-frequency streaming
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
} 