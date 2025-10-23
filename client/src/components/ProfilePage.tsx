import React, { useState, useEffect } from 'react'
import DSAApiService from '../services/dsaApi'
import type { UserProblem } from '../services/dsaApi'

interface User {
    _id: string
    name: string
    email: string
    googleId: string
    profilePicture?: string
}

interface ProfilePageProps {
    user: User
    setUser: (user: User | null) => void
}

interface DayActivity {
    date: string
    count: number
    level: 0 | 1 | 2 | 3 | 4
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const [userProblems, setUserProblems] = useState<UserProblem[]>([])
    const [loading, setLoading] = useState(true)
    const [activityData, setActivityData] = useState<DayActivity[]>([])
    const [hoveredSection, setHoveredSection] = useState<'easy' | 'medium' | 'hard' | null>(null)

    // Use Google profile picture or fallback to generated avatar
    const getProfileImageUrl = () => {
        if (user.profilePicture) {
            return user.profilePicture
        }
        const initial = user.name.charAt(0).toUpperCase()
        return `https://ui-avatars.com/api/?name=${initial}&background=10b981&color=ffffff&size=200&rounded=true`
    }

    // Fetch user problems and calculate statistics
    useEffect(() => {
        const fetchUserProblems = async () => {
            try {
                setLoading(true)
                const response = await DSAApiService.getUserProblems({ limit: 1000 })
                setUserProblems(response.userProblems)
                generateActivityData(response.userProblems)
            } catch (error) {
                console.error('Error fetching user problems:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserProblems()
    }, [])

    // Generate activity heatmap data
    const generateActivityData = (problems: UserProblem[]) => {
        const activityMap = new Map<string, number>()
        const today = new Date()
        const currentYear = today.getFullYear()

        // Start from January 1st of current year, end at December 31st of current year
        const startDate = new Date(currentYear, 0, 1) // January 1st
        const endDate = new Date(currentYear, 11, 31) // December 31st

        // Initialize all days with 0 activity
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().split('T')[0]
            activityMap.set(key, 0)
        }

        // Count problems solved per day
        problems.forEach(problem => {
            if (problem.status === 'Completed' && problem.date_solved) {
                const date = new Date(problem.date_solved).toISOString().split('T')[0]
                if (activityMap.has(date)) {
                    activityMap.set(date, (activityMap.get(date) || 0) + 1)
                }
            }
        })

        // Convert to activity levels (0-4) and sort by date
        const maxActivity = Math.max(...Array.from(activityMap.values()))
        const activities: DayActivity[] = Array.from(activityMap.entries())
            .map(([date, count]) => ({
                date,
                count,
                level: maxActivity === 0 ? 0 : Math.min(4, Math.ceil((count / maxActivity) * 4)) as 0 | 1 | 2 | 3 | 4
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        setActivityData(activities)
    }

    // Calculate statistics
    const completedProblems = userProblems.filter(p => p.status === 'Completed')
    const difficultyStats = {
        Easy: completedProblems.filter(p => (p.problemId as any)?.difficulty === 'Easy').length,
        Medium: completedProblems.filter(p => (p.problemId as any)?.difficulty === 'Medium').length,
        Hard: completedProblems.filter(p => (p.problemId as any)?.difficulty === 'Hard').length,
    }

    const totalSolved = completedProblems.length
    const currentStreak = calculateCurrentStreak(completedProblems)
    const longestStreak = calculateLongestStreak(completedProblems)

    // Calculate streaks
    function calculateCurrentStreak(problems: UserProblem[]): number {
        if (problems.length === 0) return 0

        const sortedDates = problems
            .filter(p => p.date_solved)
            .map(p => new Date(p.date_solved!).toDateString())
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

        const uniqueDates = [...new Set(sortedDates)]
        let streak = 0

        for (let i = 0; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i])
            const expectedDate = new Date()
            expectedDate.setDate(expectedDate.getDate() - i)

            if (currentDate.toDateString() === expectedDate.toDateString()) {
                streak++
            } else {
                break
            }
        }

        return streak
    }

    function calculateLongestStreak(problems: UserProblem[]): number {
        if (problems.length === 0) return 0

        const sortedDates = problems
            .filter(p => p.date_solved)
            .map(p => new Date(p.date_solved!).toDateString())
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

        const uniqueDates = [...new Set(sortedDates)]
        let maxStreak = 0
        let currentStreakCount = 1

        for (let i = 1; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i])
            const prevDate = new Date(uniqueDates[i - 1])
            const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

            if (dayDiff === 1) {
                currentStreakCount++
            } else {
                maxStreak = Math.max(maxStreak, currentStreakCount)
                currentStreakCount = 1
            }
        }

        return Math.max(maxStreak, currentStreakCount)
    }

    // Activity heatmap component
    const ActivityHeatmap = () => {
        const getColor = (level: number) => {
            switch (level) {
                case 0: return 'bg-gray-100'
                case 1: return 'bg-green-200'
                case 2: return 'bg-green-300'
                case 3: return 'bg-green-500'
                case 4: return 'bg-green-600'
                default: return 'bg-gray-100'
            }
        }

        // Create a 2D grid: 7 rows (days of week) x ~53 columns (weeks)
        const createWeeklyGrid = () => {
            if (activityData.length === 0) return []

            const grid: (DayActivity | null)[][] = Array.from({ length: 7 }, () => [])
            const startDate = new Date(activityData[0].date)
            const startDayOfWeek = startDate.getDay() // 0 = Sunday, 1 = Monday, etc.

            // Fill the first week with null values before the start date
            for (let i = 0; i < startDayOfWeek; i++) {
                grid[i].push(null)
            }

            // Fill the grid with activity data
            activityData.forEach((day, index) => {
                const dayOfWeek = (startDayOfWeek + index) % 7
                grid[dayOfWeek].push(day)
            })

            // Ensure all rows have the same length by padding with nulls
            const maxLength = Math.max(...grid.map(row => row.length))
            grid.forEach(row => {
                while (row.length < maxLength) {
                    row.push(null)
                }
            })

            return grid
        }

        const weeklyGrid = createWeeklyGrid()
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        // Generate month labels
        const getMonthLabels = () => {
            if (activityData.length === 0) return []

            const labels: { month: string; position: number }[] = []
            const seenMonths = new Set<number>()

            for (let week = 0; week < (weeklyGrid[0]?.length || 0); week++) {
                // Find the first Sunday (or first available day) in this week
                let dayInWeek = null
                for (let day = 0; day < 7; day++) {
                    if (weeklyGrid[day] && weeklyGrid[day][week]) {
                        dayInWeek = weeklyGrid[day][week]
                        break
                    }
                }

                if (dayInWeek) {
                    const date = new Date(dayInWeek.date)
                    const monthIndex = date.getMonth() // 0-11 (Jan-Dec)
                    const monthName = date.toLocaleDateString('en-US', { month: 'short' })

                    // Add month label at the beginning of each month
                    if (!seenMonths.has(monthIndex) && date.getDate() <= 7) {
                        labels.push({
                            month: monthName,
                            position: week
                        })
                        seenMonths.add(monthIndex)
                    }
                }
            }

            // Return labels in the order they appear in the grid (by position)
            return labels.sort((a, b) => a.position - b.position)
        }

        const monthLabels = getMonthLabels()

        return (
            <div className="space-y-4">
                {/* Month labels */}
                <div className="relative ml-16" style={{ height: '24px' }}>
                    {monthLabels.map((label, index) => (
                        <span
                            key={index}
                            className="absolute text-sm text-gray-500 font-medium"
                            style={{ left: `${(label.position * 20 + 8)}px` }}
                        >
                            {label.month}
                        </span>
                    ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex items-start">
                    {/* Day labels */}
                    <div className="flex flex-col justify-between mr-4 mt-4" style={{ height: '120px' }}>
                        {dayLabels.map((day, index) => (
                            <span key={index} className="text-sm text-gray-500 leading-none font-medium">
                                {index % 2 === 1 ? day : ''}
                            </span>
                        ))}
                    </div>

                    {/* Activity squares */}
                    <div className="flex overflow-x-auto min-w-0 flex-1 p-2">
                        <div className="flex">
                            {weeklyGrid[0] && weeklyGrid[0].map((_, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col mr-1">
                                    {weeklyGrid.map((dayRow, dayIndex) => (
                                        <div
                                            key={`${weekIndex}-${dayIndex}`}
                                            className={`w-4 h-4 rounded-sm mb-1 transition-all duration-200 hover:ring-2 hover:ring-green-400 hover:scale-110 cursor-pointer ${dayRow[weekIndex] ? getColor(dayRow[weekIndex]!.level) : 'bg-gray-100'
                                                }`}
                                            title={dayRow[weekIndex] ? `${dayRow[weekIndex]!.date}: ${dayRow[weekIndex]!.count} problem(s) solved` : ''}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4 ml-16">
                    <span className="font-medium">Less</span>
                    <div className="flex space-x-1">
                        {[0, 1, 2, 3, 4].map(level => (
                            <div key={level} className={`w-4 h-4 rounded-sm ${getColor(level)}`} />
                        ))}
                    </div>
                    <span className="font-medium">More</span>
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <img
                                src={getProfileImageUrl()}
                                alt={`${user.name}'s profile`}
                                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = `https://ui-avatars.com/api/?name=${user.name.charAt(0).toUpperCase()}&background=10b981&color=ffffff&size=200&rounded=true`
                                }}
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active Coder
                                </span>
                                <span className="text-sm text-gray-500">
                                    Member since {new Date().getFullYear()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{totalSolved}</p>
                                <p className="text-sm text-gray-600">Problems Solved</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{currentStreak}</p>
                                <p className="text-sm text-gray-600">Current Streak</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{longestStreak}</p>
                                <p className="text-sm text-gray-600">Longest Streak</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{userProblems.length}</p>
                                <p className="text-sm text-gray-600">Total Tracked</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Heatmap - Full Width */}
                <div className="mb-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">
                            Coding Activity
                            <span className="text-base font-normal text-gray-500 ml-2">
                                ({totalSolved} problems solved in {new Date().getFullYear()})
                            </span>
                        </h3>
                        <div className="overflow-x-auto">
                            <ActivityHeatmap />
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LeetCode-style Difficulty Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Problems Solved</h3>

                        {/* Enhanced Semicircular Progress Chart */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative w-64 h-32 mb-4 group">
                                <svg viewBox="0 0 240 120" className="w-full h-full">
                                    {/* Outer background ring */}
                                    <path
                                        d="M 30 100 A 90 90 0 0 1 210 100"
                                        stroke="#f3f4f6"
                                        strokeWidth="20"
                                        fill="none"
                                        strokeLinecap="round"
                                    />

                                    {/* Inner shadow effect */}
                                    <path
                                        d="M 35 95 A 85 85 0 0 1 205 95"
                                        stroke="#e5e7eb"
                                        strokeWidth="10"
                                        fill="none"
                                        strokeLinecap="round"
                                    />

                                    {/* Easy section - Green */}
                                    {difficultyStats.Easy > 0 && (
                                        <path
                                            d="M 30 100 A 90 90 0 0 1 210 100"
                                            stroke="#10b981"
                                            strokeWidth="18"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(difficultyStats.Easy / totalSolved) * 283} 283`}
                                            className="transition-all duration-300 hover:stroke-[20] cursor-pointer"
                                        />
                                    )}

                                    {/* Medium section - Yellow */}
                                    {difficultyStats.Medium > 0 && (
                                        <path
                                            d="M 30 100 A 90 90 0 0 1 210 100"
                                            stroke="#f59e0b"
                                            strokeWidth="18"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(difficultyStats.Medium / totalSolved) * 283} 283`}
                                            strokeDashoffset={`-${(difficultyStats.Easy / totalSolved) * 283}`}
                                            className="transition-all duration-300 hover:stroke-[20] cursor-pointer"
                                        />
                                    )}

                                    {/* Hard section - Red */}
                                    {difficultyStats.Hard > 0 && (
                                        <path
                                            d="M 30 100 A 90 90 0 0 1 210 100"
                                            stroke="#ef4444"
                                            strokeWidth="18"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(difficultyStats.Hard / totalSolved) * 283} 283`}
                                            strokeDashoffset={`-${((difficultyStats.Easy + difficultyStats.Medium) / totalSolved) * 283}`}
                                            className="transition-all duration-300 hover:stroke-[20] cursor-pointer"
                                        />
                                    )}

                                    {/* Gradient overlay for depth */}
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                                            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                                            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Invisible hover areas for better interaction */}
                                <div className="absolute inset-0">
                                    {/* Easy hover area - Left side of semicircle */}
                                    {difficultyStats.Easy > 0 && (
                                        <div
                                            className="absolute cursor-pointer"
                                            style={{
                                                left: '15%',
                                                top: '15%',
                                                width: '35%',
                                                height: '70%',
                                                borderRadius: '50% 0 0 50%'
                                            }}
                                            onMouseEnter={() => setHoveredSection('easy')}
                                            onMouseLeave={() => setHoveredSection(null)}
                                        />
                                    )}

                                    {/* Medium hover area - Top center of semicircle */}
                                    {difficultyStats.Medium > 0 && (
                                        <div
                                            className="absolute cursor-pointer"
                                            style={{
                                                left: '40%',
                                                top: '10%',
                                                width: '20%',
                                                height: '40%'
                                            }}
                                            onMouseEnter={() => setHoveredSection('medium')}
                                            onMouseLeave={() => setHoveredSection(null)}
                                        />
                                    )}

                                    {/* Hard hover area - Right side of semicircle */}
                                    {difficultyStats.Hard > 0 && (
                                        <div
                                            className="absolute cursor-pointer"
                                            style={{
                                                right: '15%',
                                                top: '15%',
                                                width: '35%',
                                                height: '70%',
                                                borderRadius: '0 50% 50% 0'
                                            }}
                                            onMouseEnter={() => setHoveredSection('hard')}
                                            onMouseLeave={() => setHoveredSection(null)}
                                        />
                                    )}
                                </div>

                                {/* Center statistics */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center mt-4 pointer-events-none">
                                    <div className="text-4xl font-bold text-gray-900 mb-1 transition-all duration-300">
                                        {hoveredSection === 'easy' ? difficultyStats.Easy :
                                            hoveredSection === 'medium' ? difficultyStats.Medium :
                                                hoveredSection === 'hard' ? difficultyStats.Hard :
                                                    totalSolved}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium transition-all duration-300">
                                        {hoveredSection === 'easy' ? 'Easy Problems' :
                                            hoveredSection === 'medium' ? 'Medium Problems' :
                                                hoveredSection === 'hard' ? 'Hard Problems' :
                                                    'Problems Solved'}
                                    </div>
                                    {totalSolved > 0 && !hoveredSection && (
                                        <div className="text-xs text-gray-400 mt-1 transition-all duration-300">
                                            {Math.round((totalSolved / (totalSolved + (userProblems.length - totalSolved))) * 100)}% completion
                                        </div>
                                    )}
                                    {hoveredSection && (
                                        <div className="text-xs text-gray-400 mt-1 transition-all duration-300">
                                            {hoveredSection === 'easy' ? Math.round((difficultyStats.Easy / totalSolved) * 100) :
                                                hoveredSection === 'medium' ? Math.round((difficultyStats.Medium / totalSolved) * 100) :
                                                    hoveredSection === 'hard' ? Math.round((difficultyStats.Hard / totalSolved) * 100) : 0}% of total
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress indicators */}
                            <div className="flex items-center space-x-6 mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                                    <span className="text-xs font-medium text-gray-600">Easy</span>
                                    <span className="text-xs font-bold text-gray-800">{difficultyStats.Easy}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                                    <span className="text-xs font-medium text-gray-600">Medium</span>
                                    <span className="text-xs font-bold text-gray-800">{difficultyStats.Medium}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                                    <span className="text-xs font-medium text-gray-600">Hard</span>
                                    <span className="text-xs font-bold text-gray-800">{difficultyStats.Hard}</span>
                                </div>
                            </div>
                        </div>

                        {/* Difficulty Stats */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-700">Easy</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">{difficultyStats.Easy}</div>
                                    <div className="text-xs text-gray-500">
                                        {totalSolved > 0 ? Math.round((difficultyStats.Easy / totalSolved) * 100) : 0}%
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-700">Medium</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">{difficultyStats.Medium}</div>
                                    <div className="text-xs text-gray-500">
                                        {totalSolved > 0 ? Math.round((difficultyStats.Medium / totalSolved) * 100) : 0}%
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-700">Hard</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">{difficultyStats.Hard}</div>
                                    <div className="text-xs text-gray-500">
                                        {totalSolved > 0 ? Math.round((difficultyStats.Hard / totalSolved) * 100) : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>

                        {/* Key metrics summary */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {userProblems.length > 0 ? Math.round((totalSolved / userProblems.length) * 100) : 0}%
                                </div>
                                <div className="text-sm text-gray-600">Overall Completion Rate</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Weekly Average</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">{Math.round(totalSolved / 52)}</div>
                                    <div className="text-xs text-gray-500">problems</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Most Active Day</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">
                                        {activityData.length > 0
                                            ? new Date(activityData.reduce((max, day) => day.count > max.count ? day : max).date).toLocaleDateString('en-US', { weekday: 'short' })
                                            : 'N/A'
                                        }
                                    </div>
                                    <div className="text-xs text-gray-500">of week</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Active Days</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">
                                        {activityData.filter(day => day.count > 0).length}
                                    </div>
                                    <div className="text-xs text-gray-500">this year</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Total Tracked</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">{userProblems.length}</div>
                                    <div className="text-xs text-gray-500">problems</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
