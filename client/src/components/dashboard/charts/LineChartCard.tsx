import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { LineChart as LineChartIcon } from 'lucide-react'
import { cn, type DashboardChartDataPoint } from '../../../lib/utils.ts'

type EChartsOption = echarts.EChartsOption

interface LineChartCardProps {
    data: DashboardChartDataPoint[]
    className?: string
}

const LineChartCard: React.FC<LineChartCardProps> = ({ data, className }) => {
    const xAxisData = useMemo(() => data.map((point) => point.date), [data])
    const solvedData = useMemo(() => data.map((point) => point.problems), [data])

    const option = useMemo<EChartsOption>(
        () => ({
            animationDuration: 700,
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderWidth: 1,
                textStyle: {
                    color: '#f8fafc',
                },
                formatter: (params) => {
                    const points = (Array.isArray(params) ? params : [params]) as unknown as Array<{
                        axisValueLabel?: string
                        marker?: string
                        value?: number
                    }>
                    const point = points[0]
                    return `${point.axisValueLabel ?? ''}<br/>${point.marker ?? ''} Solved: ${point.value ?? 0}`
                },
            },
            xAxis: {
                type: 'category',
                data: xAxisData,
                axisLine: {
                    lineStyle: {
                        color: '#475569',
                    },
                },
                axisLabel: {
                    color: '#94a3b8',
                    formatter: (value: string) => {
                        const date = new Date(value)
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    },
                },
                splitLine: {
                    show: false,
                },
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: '#475569',
                    },
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(148,163,184,0.12)',
                    },
                },
                axisLabel: {
                    color: '#94a3b8',
                },
            },
            grid: {
                top: 18,
                left: 34,
                right: 14,
                bottom: 34,
            },
            series: [
                {
                    name: 'Solved',
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 7,
                    sampling: 'average',
                    data: solvedData,
                    itemStyle: {
                        color: '#fbbf24',
                    },
                    lineStyle: {
                        width: 3,
                        color: '#fbbf24',
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgba(251,191,36,0.45)',
                            },
                            {
                                offset: 1,
                                color: 'rgba(251,191,36,0.06)',
                            },
                        ]),
                    },
                },
            ],
        }),
        [solvedData, xAxisData],
    )

    return (
        <div className={cn('flex h-full flex-col rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl', className)}>
            <div className="mb-6 flex items-center">
                <LineChartIcon className="mr-3 h-6 w-6 text-amber-300" />
                <h3 className="text-xl font-bold text-white">Problems Solved Over Time</h3>
            </div>
            <div className="relative overflow-x-auto">
                <ReactECharts
                    option={option}
                    style={{ height: 330, width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    notMerge
                    lazyUpdate
                />
            </div>
        </div>
    )
}

export default LineChartCard
