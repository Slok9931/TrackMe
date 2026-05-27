import React, { useState } from 'react'
import { LineChart as LineChartIcon } from 'lucide-react'
import { cn, type DashboardChartDataPoint } from '../../../lib/utils.ts'

interface LineChartCardProps {
    data: DashboardChartDataPoint[]
    className?: string
}

const LineChartCard: React.FC<LineChartCardProps> = ({ data, className }) => {
    const maxValue = Math.max(...data.map((point) => point.problems), 1)
    const chartHeight = 260
    const chartWidth = 760
    const leftPadding = 52
    const rightPadding = 24
    const topPadding = 20
    const innerWidth = chartWidth - leftPadding - rightPadding
    const [hoveredPoint, setHoveredPoint] = useState<{
        x: number
        y: number
        problems: number
        date: string
    } | null>(null)

    return (
        <div className={cn('flex h-full flex-col rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl', className)}>
            <div className="mb-6 flex items-center">
                <LineChartIcon className="mr-3 h-6 w-6 text-amber-300" />
                <h3 className="text-xl font-bold text-white">Problems Solved Over Time</h3>
            </div>
            <div className="relative overflow-x-auto" style={{ height: chartHeight + 46 }}>
                <svg
                    width="100%"
                    height={chartHeight + 40}
                    viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
                    preserveAspectRatio="none"
                    className="overflow-visible"
                >
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                        <line
                            key={ratio}
                            x1={leftPadding}
                            y1={topPadding + ratio * chartHeight}
                            x2={chartWidth - rightPadding}
                            y2={topPadding + ratio * chartHeight}
                            stroke="#334155"
                            strokeWidth="1"
                        />
                    ))}

                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                        <text
                            key={ratio}
                            x={leftPadding - 12}
                            y={topPadding + 6 + ratio * chartHeight}
                            textAnchor="end"
                            fontSize="12"
                            fill="#94a3b8"
                        >
                            {Math.round((1 - ratio) * maxValue)}
                        </text>
                    ))}

                    {data.length > 1 && (
                        <polyline
                            points={data
                                .map(
                                    (point, index) =>
                                        `${leftPadding + (index / (data.length - 1)) * innerWidth},${topPadding + chartHeight - (point.problems / maxValue) * chartHeight}`,
                                )
                                .join(' ')}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {data.map((point, index) => (
                        <circle
                            key={point.date}
                            cx={leftPadding + (index / Math.max(data.length - 1, 1)) * innerWidth}
                            cy={topPadding + chartHeight - (point.problems / maxValue) * chartHeight}
                            r="4"
                            fill="#fbbf24"
                            className="cursor-pointer transition-all hover:r-6"
                            onMouseEnter={() => {
                                setHoveredPoint({
                                    x: leftPadding + (index / Math.max(data.length - 1, 1)) * innerWidth,
                                    y: topPadding + chartHeight - (point.problems / maxValue) * chartHeight,
                                    problems: point.problems,
                                    date: point.date,
                                })
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />
                    ))}

                    {hoveredPoint && (
                        <g pointerEvents="none">
                            <rect
                                x={Math.min(Math.max(hoveredPoint.x - 84, leftPadding), chartWidth - 170)}
                                y={Math.max(hoveredPoint.y - 52, 8)}
                                width="160"
                                height="40"
                                rx="10"
                                fill="#0f172a"
                                stroke="#fbbf24"
                                strokeWidth="1"
                                opacity="0.95"
                            />
                            <text
                                x={Math.min(Math.max(hoveredPoint.x - 74, leftPadding + 8), chartWidth - 160)}
                                y={Math.max(hoveredPoint.y - 34, 24)}
                                fontSize="11"
                                fill="#f8fafc"
                            >
                                {`Solved: ${hoveredPoint.problems}`}
                            </text>
                            <text
                                x={Math.min(Math.max(hoveredPoint.x - 74, leftPadding + 8), chartWidth - 160)}
                                y={Math.max(hoveredPoint.y - 20, 38)}
                                fontSize="10"
                                fill="#cbd5e1"
                            >
                                {new Date(hoveredPoint.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </text>
                        </g>
                    )}
                </svg>
            </div>
        </div>
    )
}

export default LineChartCard
