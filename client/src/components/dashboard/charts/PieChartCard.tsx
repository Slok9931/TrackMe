import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { BarChart3, Target } from 'lucide-react'
import { cn, type DashboardDifficultyDataPoint } from '../../../lib/utils.ts'

type EChartsOption = echarts.EChartsOption

interface PieChartCardProps {
    data: DashboardDifficultyDataPoint[]
    className?: string
}

const PieChartCard: React.FC<PieChartCardProps> = ({ data, className }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0)
    const pieData = useMemo(
        () => data.filter((item) => item.count > 0).map((item) => ({ name: item.difficulty, value: item.count, itemStyle: { color: item.color } })),
        [data],
    )

    const option = useMemo<EChartsOption>(
        () => ({
            tooltip: {
                trigger: 'item',
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderWidth: 1,
                textStyle: {
                    color: '#f8fafc',
                },
                formatter: '{b}: {c} ({d}%)',
            },
            legend: {
                top: '5%',
                left: 'center',
                textStyle: {
                    color: '#cbd5e1',
                },
            },
            series: [
                {
                    name: 'Difficulty',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '60%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#0f172a',
                        borderWidth: 2,
                    },
                    label: {
                        show: false,
                        position: 'center',
                        color: '#fcd34d',
                    },
                    emphasis: {
                        label: {
                            show: true,
                            formatter: '{b}\n{c}',
                            fontSize: 28,
                            fontWeight: 'bold',
                            color: '#fcd34d',
                        },
                    },
                    labelLine: {
                        show: false,
                    },
                    data: pieData,
                },
            ],
        }),
        [pieData],
    )

    if (total === 0) {
        return (
            <div className={cn('rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl', className)}>
                <div className="mb-6 flex items-center">
                    <Target className="mr-3 h-6 w-6 text-amber-500" />
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

    return (
        <div className={cn('rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl', className)}>
            <div className="mb-6 flex items-center">
                <Target className="mr-3 h-6 w-6 text-amber-300" />
                <h3 className="text-xl font-bold text-white">Difficulty Distribution</h3>
            </div>
            <div className="flex items-center justify-center">
                <ReactECharts
                    option={option}
                    style={{ height: 300, width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    notMerge
                    lazyUpdate
                />
            </div>

            <div className="mt-4 flex justify-center space-x-6">
                {data.map((item) => (
                    <div key={item.difficulty} className="flex items-center space-x-2">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-300">
                            {item.difficulty}: {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PieChartCard
