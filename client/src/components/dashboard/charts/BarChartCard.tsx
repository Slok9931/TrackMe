import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { BarChart3 } from 'lucide-react'
import { cn, type DashboardChartDataPoint } from '../../../lib/utils.ts'

type EChartsOption = echarts.EChartsOption

interface BarChartCardProps {
    data: DashboardChartDataPoint[]
    className?: string
}

const BarChartCard: React.FC<BarChartCardProps> = ({ data, className }) => {
    const datasetSource = useMemo(
        () => [
            ['date', 'Easy', 'Medium', 'Hard'],
            ...data.map((point) => [
                new Date(point.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
                point.easy,
                point.medium,
                point.hard,
            ]),
        ],
        [data],
    )

    const option = useMemo<EChartsOption>(
        () => ({
            tooltip: {
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderWidth: 1,
                textStyle: {
                    color: '#f8fafc',
                },
            },
            dataset: {
                source: datasetSource,
            },
            grid: {
                top: '12%',
                left: '3%',
                right: '3%',
                bottom: '8%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                axisLine: {
                    lineStyle: {
                        color: '#475569',
                    },
                },
                axisLabel: {
                    color: '#94a3b8',
                },
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: '#475569',
                    },
                },
                axisLabel: {
                    color: '#94a3b8',
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(148,163,184,0.12)',
                    },
                },
            },
            series: [
                {
                    type: 'bar',
                    itemStyle: {
                        color: '#10b981',
                        borderRadius: [6, 6, 0, 0],
                    },
                },
                {
                    type: 'bar',
                    itemStyle: {
                        color: '#f59e0b',
                        borderRadius: [6, 6, 0, 0],
                    },
                },
                {
                    type: 'bar',
                    itemStyle: {
                        color: '#ef4444',
                        borderRadius: [6, 6, 0, 0],
                    },
                },
            ],
        }),
        [datasetSource],
    )

    return (
        <div className={cn('rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl', className)}>
            <div className="mb-6 flex items-center">
                <BarChart3 className="mr-3 h-6 w-6 text-amber-300" />
                <h3 className="text-xl font-bold text-white">Difficulty Breakdown Over Time</h3>
            </div>
            <div className="overflow-x-auto">
                <ReactECharts
                    option={option}
                    style={{ height: 340, width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    notMerge
                    lazyUpdate
                />
            </div>
        </div>
    )
}

export default BarChartCard
