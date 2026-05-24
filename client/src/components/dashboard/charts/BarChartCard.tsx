import React, { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { cn, type DashboardChartDataPoint } from '../../../lib/utils.ts'

interface BarChartCardProps {
    data: DashboardChartDataPoint[]
    className?: string
}

const BarChartCard: React.FC<BarChartCardProps> = ({ data, className }) => {
    const maxValue = Math.max(...data.map((point) => Math.max(point.easy, point.medium, point.hard)), 1)
    const safeLength = Math.max(data.length, 1)
    const barWidth = Math.max(20, Math.min(40, 600 / safeLength))
    const [hoveredBar, setHoveredBar] = useState<{
        x: number
        y: number
        label: string
        value: number
    } | null>(null)

    return (
        <div className={cn('rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl', className)}>
            <div className="mb-6 flex items-center">
                <BarChart3 className="mr-3 h-6 w-6 text-amber-300" />
                <h3 className="text-xl font-bold text-white">Difficulty Breakdown Over Time</h3>
            </div>
            <div className="overflow-x-auto">
                <svg
                    width={Math.max(800, data.length * (barWidth + 4))}
                    height="240"
                    className="overflow-visible"
                >
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                        <text
                            key={ratio}
                            x="30"
                            y={25 + ratio * 180}
                            textAnchor="end"
                            fontSize="12"
                            fill="#94a3b8"
                        >
                            {Math.round((1 - ratio) * maxValue)}
                        </text>
                    ))}

                    {data.map((point, index) => {
                        const x = 40 + index * (barWidth + 4)
                        const easyHeight = (point.easy / maxValue) * 180
                        const mediumHeight = (point.medium / maxValue) * 180
                        const hardHeight = (point.hard / maxValue) * 180

                        return (
                            <g key={point.date}>
                                <rect
                                    x={x}
                                    y={200 - easyHeight}
                                    width={barWidth / 3}
                                    height={easyHeight}
                                    fill="#10b981"
                                    className="transition-opacity hover:opacity-80"
                                    onMouseEnter={() =>
                                        setHoveredBar({
                                            x: x + barWidth / 6,
                                            y: 200 - easyHeight,
                                            label: 'Easy',
                                            value: point.easy,
                                        })
                                    }
                                    onMouseLeave={() => setHoveredBar(null)}
                                />
                                <rect
                                    x={x + barWidth / 3}
                                    y={200 - mediumHeight}
                                    width={barWidth / 3}
                                    height={mediumHeight}
                                    fill="#f59e0b"
                                    className="transition-opacity hover:opacity-80"
                                    onMouseEnter={() =>
                                        setHoveredBar({
                                            x: x + barWidth / 2,
                                            y: 200 - mediumHeight,
                                            label: 'Medium',
                                            value: point.medium,
                                        })
                                    }
                                    onMouseLeave={() => setHoveredBar(null)}
                                />
                                <rect
                                    x={x + (2 * barWidth) / 3}
                                    y={200 - hardHeight}
                                    width={barWidth / 3}
                                    height={hardHeight}
                                    fill="#ef4444"
                                    className="transition-opacity hover:opacity-80"
                                    onMouseEnter={() =>
                                        setHoveredBar({
                                            x: x + (5 * barWidth) / 6,
                                            y: 200 - hardHeight,
                                            label: 'Hard',
                                            value: point.hard,
                                        })
                                    }
                                    onMouseLeave={() => setHoveredBar(null)}
                                />
                                {index % Math.max(1, Math.floor(data.length / 10)) === 0 && (
                                    <text
                                        x={x + barWidth / 2}
                                        y="230"
                                        textAnchor="middle"
                                        fontSize="10"
                                        fill="#94a3b8"
                                    >
                                        {new Date(point.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </text>
                                )}
                            </g>
                        )
                    })}

                    {hoveredBar && (
                        <g pointerEvents="none">
                            <rect
                                x={Math.max(36, hoveredBar.x - 52)}
                                y={Math.max(8, hoveredBar.y - 46)}
                                width="104"
                                height="34"
                                rx="9"
                                fill="#0f172a"
                                stroke="#fbbf24"
                                strokeWidth="1"
                                opacity="0.95"
                            />
                            <text
                                x={Math.max(44, hoveredBar.x - 44)}
                                y={Math.max(24, hoveredBar.y - 24)}
                                fontSize="11"
                                fill="#f8fafc"
                            >
                                {`${hoveredBar.label}: ${hoveredBar.value}`}
                            </text>
                        </g>
                    )}
                </svg>
            </div>
        </div>
    )
}

export default BarChartCard
