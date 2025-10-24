import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DSAApiService from '../services/dsaApi'
import type { UserProblem } from '../services/dsaApi'

// Custom Date Picker Component
const CustomDatePicker: React.FC<{
    value: string
    onChange: (value: string) => void
    placeholder: string
}> = ({ value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isSameDay = (date1: Date | null, date2: Date | null) => {
        if (!date1 || !date2) return false
        return date1.toDateString() === date2.toDateString()
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        // Format date as YYYY-MM-DD in local timezone to avoid timezone offset issues
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        onChange(`${year}-${month}-${day}`)
        setIsOpen(false)
    }

    const clearDate = () => {
        setSelectedDate(null)
        onChange('')
        setIsOpen(false)
    }

    // Update selectedDate when value prop changes
    useEffect(() => {
        if (value && value !== selectedDate?.toISOString().split('T')[0]) {
            setSelectedDate(new Date(value))
        } else if (!value) {
            setSelectedDate(null)
        }
    }, [value])

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
            >
                <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedDate ? formatDate(selectedDate) : placeholder}
                    </span>
                </span>
                <svg className={`w-5 h-5 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 min-w-80">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day labels */}
                        <div className="grid grid-cols-7 gap-1 mb-3">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="text-sm font-medium text-gray-500 text-center py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7 gap-1 mb-4">
                            {getDaysInMonth(currentMonth).map((date, index) => (
                                <div key={index} className="aspect-square">
                                    {date && (
                                        <button
                                            type="button"
                                            onClick={() => handleDateSelect(date)}
                                            className={`w-full h-full text-sm rounded-lg hover:bg-gray-100 transition-colors ${isSameDay(date, selectedDate)
                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                : isToday(date)
                                                    ? 'bg-blue-100 text-blue-700 font-semibold'
                                                    : 'text-gray-700'
                                                }`}
                                        >
                                            {date.getDate()}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-between pt-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={clearDate}
                                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date()
                                    handleDateSelect(today)
                                }}
                                className="text-sm text-green-600 hover:text-green-700 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors font-medium"
                            >
                                Today
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

interface User {
    _id: string
    name: string
    email: string
    googleId: string
    profilePicture?: string
}

interface DSADashboardProps {
    user: User
}

type DateRange = 'today' | 'last_week' | 'this_month' | 'last_6_months' | 'last_year' | 'custom'

interface ChartData {
    date: string
    problems: number
    easy: number
    medium: number
    hard: number
}

interface DifficultyData {
    difficulty: string
    count: number
    color: string
}

const DSADashboard: React.FC<DSADashboardProps> = ({ user }) => {
    const [recentProblems, setRecentProblems] = useState<UserProblem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('this_month')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [difficultyData, setDifficultyData] = useState<DifficultyData[]>([])
    const [allUserProblems, setAllUserProblems] = useState<UserProblem[]>([])

    useEffect(() => {
        fetchDashboardData()
    }, [])

    useEffect(() => {
        generateChartData()
    }, [selectedDateRange, customStartDate, customEndDate, allUserProblems])

    const getDateRange = () => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (selectedDateRange) {
            case 'today':
                return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }
            case 'last_week':
                const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                return { start: lastWeek, end: now }
            case 'this_month':
                const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                return { start: thisMonth, end: now }
            case 'last_6_months':
                const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
                return { start: sixMonthsAgo, end: now }
            case 'last_year':
                const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
                return { start: lastYear, end: now }
            case 'custom':
                return {
                    start: customStartDate ? new Date(customStartDate) : new Date(now.getFullYear(), now.getMonth(), 1),
                    end: customEndDate ? new Date(customEndDate) : now
                }
            default:
                return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now }
        }
    }

    const generateChartData = () => {
        if (allUserProblems.length === 0) return

        const { start, end } = getDateRange()
        const filteredProblems = allUserProblems.filter(problem => {
            if (!problem.date_solved) return false
            const problemDate = new Date(problem.date_solved)
            return problemDate >= start && problemDate <= end
        })

        // Generate daily data for chart
        const dailyData = new Map<string, ChartData>()
        const current = new Date(start)

        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0]
            dailyData.set(dateStr, {
                date: dateStr,
                problems: 0,
                easy: 0,
                medium: 0,
                hard: 0
            })
            current.setDate(current.getDate() + 1)
        }

        // Populate with actual data
        filteredProblems.forEach(problem => {
            if (problem.status === 'Completed' && problem.date_solved) {
                const dateStr = new Date(problem.date_solved).toISOString().split('T')[0]
                const data = dailyData.get(dateStr)
                if (data) {
                    data.problems += 1
                    const difficulty = (problem.problemId as any)?.difficulty
                    if (difficulty === 'Easy') data.easy += 1
                    else if (difficulty === 'Medium') data.medium += 1
                    else if (difficulty === 'Hard') data.hard += 1
                }
            }
        })

        setChartData(Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date)))

        // Generate difficulty breakdown
        const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 }
        filteredProblems.forEach(problem => {
            if (problem.status === 'Completed') {
                const difficulty = (problem.problemId as any)?.difficulty
                if (difficulty && difficultyCount.hasOwnProperty(difficulty)) {
                    difficultyCount[difficulty as keyof typeof difficultyCount] += 1
                }
            }
        })

        setDifficultyData([
            { difficulty: 'Easy', count: difficultyCount.Easy, color: '#10b981' },
            { difficulty: 'Medium', count: difficultyCount.Medium, color: '#f59e0b' },
            { difficulty: 'Hard', count: difficultyCount.Hard, color: '#ef4444' }
        ])
    }

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch recent problems (latest 5)
            const problemsResponse = await DSAApiService.getUserProblems({
                page: 1,
                limit: 5
            })
            setRecentProblems(problemsResponse.userProblems)

            // Fetch all problems for charts
            const allProblemsResponse = await DSAApiService.getUserProblems({
                page: 1,
                limit: 1000
            })
            setAllUserProblems(allProblemsResponse.userProblems)

        } catch (error: any) {
            console.error('Error fetching dashboard data:', error)
            setError('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }



    const DateRangeSelector = () => (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-lg">
            <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">📅</span>
                <h3 className="text-xl font-bold text-gray-900">Analytics Period</h3>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
                {[
                    { value: 'today', label: 'Today', icon: '📅' },
                    { value: 'last_week', label: 'Last Week', icon: '📊' },
                    { value: 'this_month', label: 'This Month', icon: '📈' },
                    { value: 'last_6_months', label: 'Last 6 Months', icon: '📉' },
                    { value: 'last_year', label: 'Last Year', icon: '📋' },
                    { value: 'custom', label: 'Custom Range', icon: '🎯' }
                ].map(option => (
                    <button
                        key={option.value}
                        onClick={() => setSelectedDateRange(option.value as DateRange)}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${selectedDateRange === option.value
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                    </button>
                ))}
            </div>
            {selectedDateRange === 'custom' && (
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">📅 Start Date</label>
                            <CustomDatePicker
                                value={customStartDate}
                                onChange={setCustomStartDate}
                                placeholder="Select start date"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">📅 End Date</label>
                            <CustomDatePicker
                                value={customEndDate}
                                onChange={setCustomEndDate}
                                placeholder="Select end date"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    const LineChart = () => {
        const maxValue = Math.max(...chartData.map(d => d.problems), 1)
        const chartHeight = 240

        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg">
                <div className="flex items-center mb-6">
                    <span className="text-2xl mr-3">📈</span>
                    <h3 className="text-xl font-bold text-gray-900">Problems Solved Over Time</h3>
                </div>
                <div className="relative" style={{ height: chartHeight + 40 }}>
                    <svg width="100%" height={chartHeight + 40} className="overflow-visible">
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                            <line
                                key={ratio}
                                x1="40"
                                y1={20 + ratio * chartHeight}
                                x2="100%"
                                y2={20 + ratio * chartHeight}
                                stroke="#f3f4f6"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Y-axis labels */}
                        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                            <text
                                key={ratio}
                                x="30"
                                y={25 + ratio * chartHeight}
                                textAnchor="end"
                                fontSize="12"
                                fill="#6b7280"
                            >
                                {Math.round((1 - ratio) * maxValue)}
                            </text>
                        ))}

                        {/* Line chart */}
                        {chartData.length > 1 && (
                            <polyline
                                points={chartData.map((d, i) =>
                                    `${50 + (i / (chartData.length - 1)) * (window.innerWidth > 768 ? 600 : 250)},${20 + chartHeight - (d.problems / maxValue) * chartHeight}`
                                ).join(' ')}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Data points */}
                        {chartData.map((d, i) => (
                            <circle
                                key={d.date}
                                cx={50 + (i / Math.max(chartData.length - 1, 1)) * (window.innerWidth > 768 ? 600 : 250)}
                                cy={20 + chartHeight - (d.problems / maxValue) * chartHeight}
                                r="4"
                                fill="#10b981"
                                className="hover:r-6 transition-all cursor-pointer"
                            >
                                <title>{`${d.date}: ${d.problems} problems`}</title>
                            </circle>
                        ))}
                    </svg>
                </div>
            </div>
        )
    }

    const BarChart = () => {
        const maxValue = Math.max(...chartData.map(d => Math.max(d.easy, d.medium, d.hard)), 1)
        const barWidth = Math.max(20, Math.min(40, 600 / chartData.length))

        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg">
                <div className="flex items-center mb-6">
                    <span className="text-2xl mr-3">📊</span>
                    <h3 className="text-xl font-bold text-gray-900">Difficulty Breakdown Over Time</h3>
                </div>
                <div className="overflow-x-auto">
                    <svg width={Math.max(800, chartData.length * (barWidth + 4))} height="240" className="overflow-visible">
                        {/* Y-axis labels */}
                        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                            <text
                                key={ratio}
                                x="30"
                                y={25 + ratio * 180}
                                textAnchor="end"
                                fontSize="12"
                                fill="#6b7280"
                            >
                                {Math.round((1 - ratio) * maxValue)}
                            </text>
                        ))}

                        {/* Bars */}
                        {chartData.map((d, i) => {
                            const x = 40 + i * (barWidth + 4)
                            const easyHeight = (d.easy / maxValue) * 180
                            const mediumHeight = (d.medium / maxValue) * 180
                            const hardHeight = (d.hard / maxValue) * 180

                            return (
                                <g key={d.date}>
                                    {/* Easy */}
                                    <rect
                                        x={x}
                                        y={200 - easyHeight}
                                        width={barWidth / 3}
                                        height={easyHeight}
                                        fill="#10b981"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <title>{`${d.date}: ${d.easy} Easy`}</title>
                                    </rect>
                                    {/* Medium */}
                                    <rect
                                        x={x + barWidth / 3}
                                        y={200 - mediumHeight}
                                        width={barWidth / 3}
                                        height={mediumHeight}
                                        fill="#f59e0b"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <title>{`${d.date}: ${d.medium} Medium`}</title>
                                    </rect>
                                    {/* Hard */}
                                    <rect
                                        x={x + (2 * barWidth) / 3}
                                        y={200 - hardHeight}
                                        width={barWidth / 3}
                                        height={hardHeight}
                                        fill="#ef4444"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <title>{`${d.date}: ${d.hard} Hard`}</title>
                                    </rect>
                                    {/* Date label */}
                                    {i % Math.max(1, Math.floor(chartData.length / 10)) === 0 && (
                                        <text
                                            x={x + barWidth / 2}
                                            y="230"
                                            textAnchor="middle"
                                            fontSize="10"
                                            fill="#6b7280"
                                        >
                                            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </text>
                                    )}
                                </g>
                            )
                        })}
                    </svg>
                </div>
            </div>
        )
    }

    const PieChart = () => {
        const total = difficultyData.reduce((sum, d) => sum + d.count, 0)
        if (total === 0) {
            return (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg">
                    <div className="flex items-center mb-6">
                        <span className="text-2xl mr-3">🥧</span>
                        <h3 className="text-xl font-bold text-gray-900">Difficulty Distribution</h3>
                    </div>
                    <div className="flex items-center justify-center h-40 text-gray-500">
                        <div className="text-center">
                            <span className="text-4xl mb-2 block">📊</span>
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
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg">
                <div className="flex items-center mb-6">
                    <span className="text-2xl mr-3">🥧</span>
                    <h3 className="text-xl font-bold text-gray-900">Difficulty Distribution</h3>
                </div>
                <div className="flex items-center justify-center">
                    <svg width="240" height="200">
                        {difficultyData.map((d) => {
                            if (d.count === 0) return null

                            const percentage = (d.count / total) * 100
                            const angle = (d.count / total) * 360
                            const startAngle = currentAngle
                            const endAngle = currentAngle + angle

                            const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)
                            const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)
                            const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180)
                            const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180)

                            const largeArcFlag = angle > 180 ? 1 : 0

                            const pathData = [
                                `M ${centerX} ${centerY}`,
                                `L ${x1} ${y1}`,
                                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                'Z'
                            ].join(' ')

                            currentAngle += angle

                            return (
                                <path
                                    key={d.difficulty}
                                    d={pathData}
                                    fill={d.color}
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                    <title>{`${d.difficulty}: ${d.count} (${percentage.toFixed(1)}%)`}</title>
                                </path>
                            )
                        })}

                        {/* Center circle */}
                        <circle cx={centerX} cy={centerY} r="30" fill="white" stroke="#e5e7eb" strokeWidth="2" />
                        <text x={centerX} y={centerY - 5} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#374151">
                            {total}
                        </text>
                        <text x={centerX} y={centerY + 10} textAnchor="middle" fontSize="12" fill="#6b7280">
                            Total
                        </text>
                    </svg>
                </div>

                {/* Legend */}
                <div className="flex justify-center space-x-6 mt-4">
                    {difficultyData.map(d => (
                        <div key={d.difficulty} className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                            <span className="text-sm text-gray-700">{d.difficulty}: {d.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse animation-delay-200"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse animation-delay-400"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
            {/* Main Content */}
            <main className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="mb-10">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">
                                        Welcome back, {user.name.split(' ')[0]}! 🚀
                                    </h1>
                                    <p className="text-xl text-green-100 mb-4">
                                        Master Data Structures & Algorithms • Ace Your Coding Interviews
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            to="/dsa/add"
                                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-xl transition-all duration-200 font-semibold"
                                        >
                                            Add Problem ✨
                                        </Link>
                                        <Link
                                            to="/dsa/problems"
                                            className="border border-white/30 hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-200 font-semibold"
                                        >
                                            View All Problems
                                        </Link>
                                    </div>
                                </div>
                                <div className="hidden lg:block">
                                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                                        <span className="text-6xl">💻</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Solved</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {allUserProblems.filter(p => p.status === 'Completed').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Easy Problems</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {allUserProblems.filter(p => p.status === 'Completed' && (p.problemId as any)?.difficulty === 'Easy').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🟢</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Medium Problems</p>
                                <p className="text-3xl font-bold text-yellow-600">
                                    {allUserProblems.filter(p => p.status === 'Completed' && (p.problemId as any)?.difficulty === 'Medium').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🟡</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Hard Problems</p>
                                <p className="text-3xl font-bold text-red-600">
                                    {allUserProblems.filter(p => p.status === 'Completed' && (p.problemId as any)?.difficulty === 'Hard').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🔴</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date Range Selector */}
                <DateRangeSelector />

                {/* Charts Section */}
                <div className="space-y-8 mb-10">
                    {/* Line Chart */}
                    <LineChart />

                    {/* Bar Chart and Pie Chart */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2">
                            <BarChart />
                        </div>
                        <div>
                            <PieChart />
                        </div>
                    </div>
                </div>

                {/* Recent Problems */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🔥</span>
                            <h3 className="text-xl font-bold text-gray-900">Recent Problems</h3>
                        </div>
                        <Link
                            to="/dsa/problems"
                            className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            View All Problems →
                        </Link>
                    </div>

                    {recentProblems.length === 0 ? (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
                            <div className="text-6xl mb-4">🚀</div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-3">Ready to Start Your DSA Journey?</h4>
                            <p className="text-gray-600 mb-6 text-lg">Add your first problem and begin mastering algorithms!</p>
                            <Link
                                to="/dsa/add"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span className="mr-2">✨</span>
                                Add Your First Problem
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentProblems.map((userProblem) => {
                                const problem = userProblem.problemId as any // Will be populated
                                const difficultyColors = {
                                    'Easy': 'bg-green-100 text-green-800 border-green-200',
                                    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                    'Hard': 'bg-red-100 text-red-800 border-red-200'
                                }
                                const statusIcon = userProblem.status === 'Completed' ? '✅' : '⏳'

                                return (
                                    <div key={userProblem._id} className="group p-6 border border-gray-200 rounded-2xl hover:border-green-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <span className="text-xl">{statusIcon}</span>
                                                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-green-600 transition-colors">{problem.title}</h4>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${difficultyColors[problem.difficulty as keyof typeof difficultyColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </div>
                                                {problem.topicTags && problem.topicTags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {problem.topicTags.slice(0, 4).map((tag: any) => (
                                                            <span key={tag.slug} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg border border-blue-200">
                                                                #{tag.name}
                                                            </span>
                                                        ))}
                                                        {problem.topicTags.length > 4 && (
                                                            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-lg border border-gray-200">
                                                                +{problem.topicTags.length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {userProblem.date_solved && (
                                                    <p className="text-sm text-gray-500">
                                                        📅 Solved on {new Date(userProblem.date_solved).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col space-y-2 ml-4">
                                                <Link
                                                    to={`/dsa/problems/${userProblem._id}`}
                                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-semibold text-center"
                                                >
                                                    📝 View Details
                                                </Link>
                                                <a
                                                    href={problem.problemUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-semibold text-center"
                                                >
                                                    🔗 LeetCode
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default DSADashboard
