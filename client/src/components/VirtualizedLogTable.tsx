import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface MetricPayload {
    serverId: string;
    timestamp: number;
    cpuUsage: number;
    memoryUsedMB: number;
    memoryTotalMB: number;
    status: 'HEALTHY' | 'CRITICAL';
}

interface VirtualizedLogTableProps {
    metricsHistory: MetricPayload[];
}

export function VirtualizedLogTable({ metricsHistory }: VirtualizedLogTableProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: metricsHistory.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40, // Height in pixels per row
        overscan: 5,            // Extra rendered rows above/below viewport
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-sm font-semibold text-white">Virtualized Telemetry Stream</h2>
                    <p className="text-xs text-slate-400">Bounded DOM rendering for high-frequency logs</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                    {metricsHistory.length} Buffer Size | {rowVirtualizer.getVirtualItems().length} Mounted DOM Nodes
                </span>
            </div>

            {/* Outer Scroll Container */}
            <div
                ref={parentRef}
                className="h-96 overflow-auto border border-slate-800 rounded bg-slate-950/50"
            >
                {/* Inner Container with Total Scroll Height */}
                <div
                    className="w-full relative"
                    style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                >
                    <div className="w-full text-left text-xs text-slate-300 font-mono">
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = metricsHistory[virtualRow.index];
                            return (
                                <div
                                    key={virtualRow.key}
                                    className="absolute top-0 left-0 w-full flex items-center border-b border-slate-800/50 hover:bg-slate-800/30 px-3 py-2 text-[11px]"
                                    style={{
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    <div className="w-1/5 text-slate-500">
                                        {new Date(row.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div className="w-1/5 text-white font-medium">{row.serverId}</div>
                                    <div className="w-1/5">{row.cpuUsage}% CPU</div>
                                    <div className="w-1/5">
                                        {row.memoryUsedMB} / {row.memoryTotalMB} MB
                                    </div>
                                    <div className="w-1/5">
                                        <span
                                            className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-sans font-medium ${row.status === 'HEALTHY'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-rose-500/10 text-rose-400'
                                                }`}
                                        >
                                            {row.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}