import React, { useState } from 'react'
import { BarChart3, Target } from 'lucide-react'
import { cn, type DashboardDifficultyDataPoint } from '../../../lib/utils.ts'

interface PieChartCardProps {
    data: DashboardDifficultyDataPoint[]
    className?: string
}

const PieChartCard: React.FC<PieChartCardProps> = ({ data, className }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0)
    const [hoveredSlice, setHoveredSlice] = useState<{
        x: number
        y: number
        difficulty: string
        count: number
        percentage: number
    } | null>(null)

    if (total === 0) {
        return (
            <div className={cn('rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl', className)}>
                <div className="mb-6 flex items-center">
                    <Target className="mr-3 h-6 w-6 text-amber-300" />
                    <h3 className="text-xl font-bold text-white">Difficulty Distribution</h3>
                </div>
                <div className="flex h-40 items-center justify-center text-slate-400">
                    <div className="text-center">
                        <BarChart3 className="mx-auto mb-2 h-10 w-10" />
                        <p className="text-sm">No data available for selected range</p>
                    </div>
                </div>
            </div>
        )
    }

    let currentAngle = 0
    const radius = 80
    const centerX = 120
    const centerY = 100

    return (
        <div className={cn('rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl', className)}>
            <div className="mb-6 flex items-center">
                <Target className="mr-3 h-6 w-6 text-amber-300" />
                <h3 className="text-xl font-bold text-white">Difficulty Distribution</h3>
            </div>
            <div className="flex items-center justify-center">
                <svg width="240" height="200">
                    {data.map((item) => {
                        if (item.count === 0) return null

                        const percentage = (item.count / total) * 100
                        const angle = (item.count / total) * 360
                        const startAngle = currentAngle
                        const endAngle = currentAngle + angle
                        const midAngle = (startAngle + endAngle) / 2

                        const x1 = centerX + radius * Math.cos(((startAngle - 90) * Math.PI) / 180)
                        const y1 = centerY + radius * Math.sin(((startAngle - 90) * Math.PI) / 180)
                        const x2 = centerX + radius * Math.cos(((endAngle - 90) * Math.PI) / 180)
                        const y2 = centerY + radius * Math.sin(((endAngle - 90) * Math.PI) / 180)

                        const largeArcFlag = angle > 180 ? 1 : 0

                        const pathData = [
                            `M ${centerX} ${centerY}`,
                            `L ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            'Z',
                        ].join(' ')

                        currentAngle += angle

                        return (
                            <path
                                key={item.difficulty}
                                d={pathData}
                                fill={item.color}
                                className="cursor-pointer transition-opacity hover:opacity-80"
                                onMouseEnter={() =>
                                    setHoveredSlice({
                                        x: centerX + Math.cos(((midAngle - 90) * Math.PI) / 180) * (radius * 0.75),
                                        y: centerY + Math.sin(((midAngle - 90) * Math.PI) / 180) * (radius * 0.75),
                                        difficulty: item.difficulty,
                                        count: item.count,
                                        percentage,
                                    })
                                }
                                onMouseLeave={() => setHoveredSlice(null)}
                            />
                        )
                    })}

                    {hoveredSlice && (
                        <g pointerEvents="none">
                            <rect
                                x={Math.max(8, hoveredSlice.x - 66)}
                                y={Math.max(6, hoveredSlice.y - 44)}
                                width="132"
                                height="36"
                                rx="9"
                                fill="#0f172a"
                                stroke="#fbbf24"
                                strokeWidth="1"
                                opacity="0.95"
                            />
                            <text
                                x={Math.max(14, hoveredSlice.x - 58)}
                                y={Math.max(22, hoveredSlice.y - 22)}
                                fontSize="11"
                                fill="#f8fafc"
                            >
                                {`${hoveredSlice.difficulty}: ${hoveredSlice.count}`}
                            </text>
                            <text
                                x={Math.max(14, hoveredSlice.x - 58)}
                                y={Math.max(34, hoveredSlice.y - 10)}
                                fontSize="10"
                                fill="#cbd5e1"
                            >
                                {`${hoveredSlice.percentage.toFixed(1)}%`}
                            </text>
                        </g>
                    )}

                    <circle
                        cx={centerX}
                        cy={centerY}
                        r="30"
                        fill="#0f172a"
                        stroke="#334155"
                        strokeWidth="2"
                    />
                    <text
                        x={centerX}
                        y={centerY - 5}
                        textAnchor="middle"
                        fontSize="16"
                        fontWeight="bold"
                        fill="#ffffff"
                    >
                        {total}
                    </text>
                    <text
                        x={centerX}
                        y={centerY + 10}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#ffffff"
                    >
                        Total
                    </text>
                </svg>
            </div>

            <div className="mt-4 flex justify-center space-x-6">
                {data.map((item) => (
                    <div key={item.difficulty} className="flex items-center space-x-2">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-200">
                            {item.difficulty}: {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PieChartCard
