import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DSAApiService from '../services/dsaApi'
import type { UserProblem, PaginationInfo } from '../services/dsaApi'

// Custom Dropdown Component
const CustomDropdown: React.FC<{
    value: string
    options: { value: string; label: string; icon?: string }[]
    onChange: (value: string) => void
    placeholder: string
}> = ({ value, options, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find(opt => opt.value === value)

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white"
            >
                <span className="flex items-center">
                    {selectedOption?.icon && <span className="mr-2">{selectedOption.icon}</span>}
                    {selectedOption?.label || placeholder}
                </span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-50 ${value === option.value ? 'bg-green-50 text-green-700' : 'text-gray-700'
                                    }`}
                            >
                                {option.icon && <span className="mr-2">{option.icon}</span>}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

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

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white"
            >
                <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {selectedDate ? formatDate(selectedDate) : placeholder}
                </span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-64">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h3 className="text-sm font-semibold">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day labels */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth(currentMonth).map((date, index) => (
                                <div key={index} className="aspect-square">
                                    {date && (
                                        <button
                                            type="button"
                                            onClick={() => handleDateSelect(date)}
                                            className={`w-full h-full text-xs rounded hover:bg-gray-100 ${isSameDay(date, selectedDate)
                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                : isToday(date)
                                                    ? 'bg-blue-100 text-blue-700'
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
                        <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={clearDate}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date()
                                    handleDateSelect(today)
                                }}
                                className="text-xs text-green-600 hover:text-green-700"
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

const ProblemsList: React.FC = () => {
    const [problems, setProblems] = useState<UserProblem[]>([])
    const [pagination, setPagination] = useState<PaginationInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filters
    const [statusFilter, setStatusFilter] = useState<'All' | 'Todo' | 'Completed'>('All')
    const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All')
    const [platformFilter, setPlatformFilter] = useState<'All' | 'leetcode' | 'gfg'>('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [dateFromFilter, setDateFromFilter] = useState('')
    const [dateToFilter, setDateToFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Revision modal states
    const [revisionModalOpen, setRevisionModalOpen] = useState(false)
    const [selectedProblem, setSelectedProblem] = useState<UserProblem | null>(null)
    const [newRevisionNote, setNewRevisionNote] = useState('')
    const [addingRevision, setAddingRevision] = useState(false)

    // Delete modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [problemToDelete, setProblemToDelete] = useState<UserProblem | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        fetchProblems()
    }, [statusFilter, difficultyFilter, platformFilter, searchQuery, dateFromFilter, dateToFilter, currentPage])

    const fetchProblems = async () => {
        try {
            setLoading(true)
            setError(null)

            const params: any = {
                page: currentPage,
                limit: 10
            }

            if (statusFilter !== 'All') params.status = statusFilter
            if (difficultyFilter !== 'All') params.difficulty = difficultyFilter
            if (platformFilter !== 'All') params.platform = platformFilter
            if (searchQuery.trim()) params.search = searchQuery.trim()
            if (dateFromFilter) params.dateFrom = dateFromFilter
            if (dateToFilter) params.dateTo = dateToFilter

            const response = await DSAApiService.getUserProblems(params)
            setProblems(response.userProblems)
            setPagination(response.pagination)

        } catch (error: any) {
            console.error('Error fetching problems:', error)
            setError('Failed to load problems')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (userProblemId: string, newStatus: 'Todo' | 'Completed') => {
        try {
            // Optimistic update - update UI immediately
            setProblems((prevProblems: UserProblem[]) =>
                prevProblems.map((problem: UserProblem) =>
                    problem._id === userProblemId
                        ? {
                            ...problem,
                            status: newStatus,
                            date_solved: newStatus === 'Completed' ? new Date().toISOString() : undefined
                        }
                        : problem
                )
            )

            // Then update the backend
            await DSAApiService.updateUserProblem(userProblemId, { status: newStatus })
        } catch (error: any) {
            console.error('Error updating status:', error)
            // Revert optimistic update on error
            setProblems((prevProblems: UserProblem[]) =>
                prevProblems.map((problem: UserProblem) =>
                    problem._id === userProblemId
                        ? {
                            ...problem,
                            status: newStatus === 'Todo' ? 'Completed' : 'Todo',
                            date_solved: newStatus === 'Todo' ? new Date().toISOString() : undefined
                        }
                        : problem
                )
            )
            alert('Failed to update status')
        }
    }

    const handleDeleteClick = (userProblem: UserProblem) => {
        setProblemToDelete(userProblem)
        setDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!problemToDelete) return

        const userProblemId = problemToDelete._id
        const removedProblem = problemToDelete

        try {
            setDeleting(true)

            // Optimistic update - remove from UI immediately
            setProblems((prevProblems: UserProblem[]) =>
                prevProblems.filter((problem: UserProblem) => problem._id !== userProblemId)
            )

            // Then update the backend
            await DSAApiService.deleteUserProblem(userProblemId)

            // Close modal and reset state
            setDeleteModalOpen(false)
            setProblemToDelete(null)
        } catch (error: any) {
            console.error('Error deleting problem:', error)
            // Revert optimistic update on error - add the problem back
            setProblems((prevProblems: UserProblem[]) => [...prevProblems, removedProblem])
            alert('Failed to delete problem')
        } finally {
            setDeleting(false)
        }
    }

    const handleRevisionClick = (userProblem: UserProblem) => {
        setSelectedProblem(userProblem)
        setRevisionModalOpen(true)
    }

    const handleAddRevision = async () => {
        if (!selectedProblem || !newRevisionNote.trim()) return

        try {
            setAddingRevision(true)
            await DSAApiService.addRevision(selectedProblem._id, newRevisionNote.trim())

            // Calculate next revision number
            const nextRevisionNo = selectedProblem.revision_history.length + 1
            const newRevision = {
                revision_no: nextRevisionNo,
                revision_date: new Date().toISOString(),
                revision_notes: newRevisionNote.trim()
            }

            // Update the local state to reflect the new revision
            setProblems(prevProblems =>
                prevProblems.map(p =>
                    p._id === selectedProblem._id
                        ? {
                            ...p,
                            revision_history: [
                                ...p.revision_history,
                                newRevision
                            ]
                        }
                        : p
                )
            )

            // Update selected problem for modal
            setSelectedProblem(prev => prev ? {
                ...prev,
                revision_history: [
                    ...prev.revision_history,
                    newRevision
                ]
            } : null)

            setNewRevisionNote('')
        } catch (error: any) {
            console.error('Error adding revision:', error)
            alert('Failed to add revision')
        } finally {
            setAddingRevision(false)
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600 bg-green-50 border-green-200'
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'Hard': return 'text-red-600 bg-red-50 border-red-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
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
        <div className="bg-gray-50">
            {/* Main Content */}
            <main className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">My Problems</h2>
                            <p className="text-gray-600 mt-1">Track your DSA journey and progress</p>
                        </div>
                        <Link
                            to="/dsa/add"
                            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Problem
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Problems</p>
                                    <p className="text-2xl font-bold text-gray-900">{pagination?.totalItems || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">{problems.filter(p => p.status === 'Completed').length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">{problems.filter(p => p.status === 'Todo').length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                            </svg>
                            <span className="text-lg font-semibold text-gray-900">Filters & Search</span>
                        </div>
                        <button
                            onClick={() => {
                                setStatusFilter('All')
                                setDifficultyFilter('All')
                                setPlatformFilter('All')
                                setSearchQuery('')
                                setDateFromFilter('')
                                setDateToFilter('')
                                setCurrentPage(1)
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset All
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Problems</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setCurrentPage(1)
                                }}
                                placeholder="Search by problem title..."
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-2 focus:border-green-500 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('')
                                        setCurrentPage(1)
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <CustomDropdown
                                value={statusFilter}
                                onChange={(value) => {
                                    setStatusFilter(value as any)
                                    setCurrentPage(1)
                                }}
                                placeholder="All Status"
                                options={[
                                    { value: 'All', label: 'All Status' },
                                    { value: 'Todo', label: 'Todo', icon: '📋' },
                                    { value: 'Completed', label: 'Completed', icon: '✅' }
                                ]}
                            />
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                            <CustomDropdown
                                value={difficultyFilter}
                                onChange={(value) => {
                                    setDifficultyFilter(value as any)
                                    setCurrentPage(1)
                                }}
                                placeholder="All Levels"
                                options={[
                                    { value: 'All', label: 'All Levels' },
                                    { value: 'Easy', label: 'Easy', icon: '🟢' },
                                    { value: 'Medium', label: 'Medium', icon: '🟡' },
                                    { value: 'Hard', label: 'Hard', icon: '🔴' }
                                ]}
                            />
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                            <div className="space-y-2">
                                <CustomDatePicker
                                    value={dateFromFilter}
                                    onChange={(value) => {
                                        setDateFromFilter(value)
                                        setCurrentPage(1)
                                    }}
                                    placeholder="Select date"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                            <div className="space-y-2">
                                <CustomDatePicker
                                    value={dateToFilter}
                                    onChange={(value) => {
                                        setDateToFilter(value)
                                        setCurrentPage(1)
                                    }}
                                    placeholder="Select date"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(statusFilter !== 'All' || difficultyFilter !== 'All' || searchQuery || dateFromFilter || dateToFilter) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-2 text-sm">
                                <span className="text-gray-500">Active filters:</span>
                                <div className="flex flex-wrap gap-2">
                                    {statusFilter !== 'All' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Status: {statusFilter}
                                            <button
                                                onClick={() => setStatusFilter('All')}
                                                className="ml-1 text-green-600 hover:text-green-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {difficultyFilter !== 'All' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Difficulty: {difficultyFilter}
                                            <button
                                                onClick={() => setDifficultyFilter('All')}
                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {searchQuery && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            Search: {searchQuery}
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="ml-1 text-purple-600 hover:text-purple-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {(dateFromFilter || dateToFilter) && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            Date: {dateFromFilter && new Date(dateFromFilter).toLocaleDateString()}
                                            {dateFromFilter && dateToFilter && ' - '}
                                            {dateToFilter && new Date(dateToFilter).toLocaleDateString()}
                                            <button
                                                onClick={() => {
                                                    setDateFromFilter('')
                                                    setDateToFilter('')
                                                }}
                                                className="ml-1 text-orange-600 hover:text-orange-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Problems Table */}
                {error ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                        <div className="text-red-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Problems</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchProblems}
                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : problems.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                        <div className="text-gray-400 mb-6">
                            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No problems found</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {statusFilter !== 'All' || difficultyFilter !== 'All' || platformFilter !== 'All'
                                ? 'Try adjusting your filters or add some problems to get started.'
                                : 'Start tracking your DSA journey by adding your first problem.'
                            }
                        </p>
                        <Link
                            to="/dsa/add"
                            className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Your First Problem
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Problem
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Difficulty
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Solved
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Revisions
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {problems.map((userProblem) => {
                                        const problem = userProblem.problemId as any
                                        return (
                                            <tr key={userProblem._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                                                            <span className="mr-2">
                                                                {problem.platform === 'gfg' ? '🟢' : '🟠'}
                                                            </span>
                                                            {problem.title}
                                                        </div>
                                                        {problem.topicTags && problem.topicTags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {problem.topicTags.slice(0, 3).map((tag: any) => (
                                                                    <span key={tag.slug} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                                        {tag.name}
                                                                    </span>
                                                                ))}
                                                                {problem.topicTags.length > 3 && (
                                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                                        +{problem.topicTags.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                                                        {problem.difficulty === 'Easy' && '🟢'}
                                                        {problem.difficulty === 'Medium' && '🟡'}
                                                        {problem.difficulty === 'Hard' && '🔴'}
                                                        {' '}{problem.difficulty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusUpdate(userProblem._id, userProblem.status === 'Todo' ? 'Completed' : 'Todo')}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${userProblem.status === 'Completed' ? 'bg-green-500' : 'bg-gray-200'
                                                                }`}
                                                            role="switch"
                                                            aria-checked={userProblem.status === 'Completed'}
                                                            title={`Toggle to ${userProblem.status === 'Todo' ? 'Completed' : 'Todo'}`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userProblem.status === 'Completed' ? 'translate-x-6' : 'translate-x-1'
                                                                    }`}
                                                            />
                                                        </button>
                                                        {userProblem.status === 'Completed' ? <span className={`text-xs font-medium ${userProblem.status === 'Completed' ? 'text-green-600' : 'text-gray-400'}`}>
                                                            ✅
                                                        </span> : <span className={`text-xs font-medium ${userProblem.status === 'Todo' ? 'text-orange-600' : 'text-gray-400'}`}>
                                                            📋
                                                        </span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {userProblem.date_solved
                                                        ? new Date(userProblem.date_solved).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <button
                                                        onClick={() => handleRevisionClick(userProblem)}
                                                        className="flex items-center hover:text-green-600 transition-colors cursor-pointer"
                                                        title="View revision history"
                                                    >
                                                        <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        {userProblem.revision_history.length}
                                                        <svg className="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            to={`/dsa/problems/${userProblem._id}`}
                                                            className="text-green-600 hover:text-green-700 text-xs font-medium"
                                                            title="View Details"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>
                                                        <a
                                                            href={problem.problemUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                                            title="Open in LeetCode"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteClick(userProblem)}
                                                            className="text-red-600 hover:text-red-700 text-xs font-medium"
                                                            title="Delete Problem"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * 10, pagination.totalItems)}</span> of{' '}
                                <span className="font-medium">{pagination.totalItems}</span> problems
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        let page
                                        if (pagination.totalPages <= 5) {
                                            page = i + 1
                                        } else if (currentPage <= 3) {
                                            page = i + 1
                                        } else if (currentPage >= pagination.totalPages - 2) {
                                            page = pagination.totalPages - 4 + i
                                        } else {
                                            page = currentPage - 2 + i
                                        }

                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${currentPage === page
                                                    ? 'bg-green-500 text-white border-green-500'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    Next
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setCurrentPage(pagination.totalPages)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Revision Modal */}
                {revisionModalOpen && selectedProblem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Revision History</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {(selectedProblem.problemId as any).title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setRevisionModalOpen(false)
                                        setSelectedProblem(null)
                                        setNewRevisionNote('')
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto h-[40vh]">
                                {selectedProblem.revision_history.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="text-gray-400 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No revisions yet</h3>
                                        <p className="text-gray-600">Start tracking your revision notes for this problem.</p>
                                    </div>
                                ) : (
                                    <div className="p-6 space-y-4">
                                        {selectedProblem.revision_history
                                            .sort((a, b) => b.revision_no - a.revision_no)
                                            .map((revision) => (
                                                <div key={revision.revision_no} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-green-600">
                                                            Revision #{revision.revision_no}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(revision.revision_date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                        {revision.revision_notes}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {/* Add New Revision Section */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Revision</h3>
                                <div className="space-y-3">
                                    <textarea
                                        value={newRevisionNote}
                                        onChange={(e) => setNewRevisionNote(e.target.value)}
                                        placeholder="What did you learn or improve in this revision?&#10;&#10;Example:&#10;- Optimized the approach from O(n²) to O(n)&#10;- Better understood the two-pointer technique&#10;- Fixed edge case with empty arrays"
                                        rows={8}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            Track your learning progress and improvements
                                        </span>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setRevisionModalOpen(false)
                                                    setSelectedProblem(null)
                                                    setNewRevisionNote('')
                                                }}
                                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddRevision}
                                                disabled={!newRevisionNote.trim() || addingRevision}
                                                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                            >
                                                {addingRevision ? (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        Add
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && problemToDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mr-4">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Delete Problem</h3>
                                        <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="px-6 py-4">
                                <p className="text-gray-700 mb-4">
                                    Are you sure you want to remove <span className="font-semibold text-gray-900">"{(problemToDelete.problemId as any).title}"</span> from your tracking list?
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <div className="text-sm text-red-700">
                                            <p className="font-medium">This will permanently delete:</p>
                                            <ul className="mt-1 list-disc list-inside space-y-1">
                                                <li>Your progress tracking for this problem</li>
                                                <li>All revision notes ({problemToDelete.revision_history.length} revisions)</li>
                                                <li>Your solution notes and completion status</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setDeleteModalOpen(false)
                                        setProblemToDelete(null)
                                    }}
                                    disabled={deleting}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={deleting}
                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                >
                                    {deleting ? (
                                        <>
                                            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Problem
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default ProblemsList
