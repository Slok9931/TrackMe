import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DSAApiService from '../services/dsaApi'
import type { UserProblem, PaginationInfo } from '../services/dsaApi'
import {
    AlertTriangle,
    BarChart3,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Circle,
    Compass,
    ExternalLink,
    Eye,
    Filter,
    Flame,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react'

const toLocalDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

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
        <div className="relative z-50">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 shadow-[0_10px_30px_rgba(2,6,23,0.25)] transition-all hover:border-amber-300/40 hover:bg-slate-900/90 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/40"
            >
                <span className="flex items-center">
                    {selectedOption?.icon && <span className="mr-2">{selectedOption.icon}</span>}
                    <span className={selectedOption ? 'text-slate-100' : 'text-slate-400'}>
                        {selectedOption?.label || placeholder}
                    </span>
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/15 bg-slate-900 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                                className={`flex w-full items-center px-4 py-3 text-left text-sm transition-colors hover:bg-white/5 ${value === option.value ? 'bg-amber-300/10 text-amber-100' : 'text-slate-200'
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

    useEffect(() => {
        if (value && value !== (selectedDate ? toLocalDateKey(selectedDate) : undefined)) {
            setSelectedDate(new Date(value))
        } else if (!value) {
            setSelectedDate(null)
        }
    }, [value])

    return (
        <div className="relative z-50">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 shadow-[0_10px_30px_rgba(2,6,23,0.25)] transition-all hover:border-amber-300/40 hover:bg-slate-900/90 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/40"
            >
                <span className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-slate-300" />
                    <span className={selectedDate ? 'text-slate-100' : 'text-slate-400'}>
                        {selectedDate ? formatDate(selectedDate) : placeholder}
                    </span>
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 mt-2 min-w-80 rounded-xl border border-white/15 bg-slate-900 p-4 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <h3 className="text-sm font-semibold text-white">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Day labels */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="py-1 text-center text-xs font-medium text-slate-400">
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
                                            className={`h-full w-full rounded-lg text-xs transition-colors hover:bg-white/10 ${isSameDay(date, selectedDate)
                                                ? 'bg-amber-300 text-slate-950 hover:bg-amber-200'
                                                : isToday(date)
                                                    ? 'bg-amber-300/20 text-amber-100'
                                                    : 'text-slate-200'
                                                }`}
                                        >
                                            {date.getDate()}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-between mt-4 pt-3 border-t border-white/10">
                            <button
                                type="button"
                                onClick={clearDate}
                                className="rounded-lg px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date()
                                    handleDateSelect(today)
                                }}
                                className="rounded-lg px-3 py-1 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-300/10 hover:text-amber-100"
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

    if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-8 py-7 backdrop-blur-xl shadow-[0_24px_70px_rgba(2,6,23,0.65)]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse animation-delay-400"></div>
          </div>
          <p className="text-sm tracking-wide text-slate-300">Loading problems...</p>
        </div>
      </div>
    );
  }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

            <main className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-10">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-50 flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-amber-300" />
                                My Problems
                            </h2>
                            <p className="text-slate-400 mt-2 text-sm">Track and master your DSA problem-solving journey</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="relative z-50 rounded-3xl border border-white/15 bg-slate-900/55 p-6 mb-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-amber-300" />
                            <span className="text-lg font-semibold text-slate-100">Search & Filter</span>
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
                            className="text-xs text-slate-400 hover:text-slate-200 flex items-center transition-colors"
                        >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Reset All
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-3">Search Problems</label>
                        <div className="relative">
                            <Search className="absolute inset-y-0 left-0 ml-3 w-4 h-4 text-slate-400 flex-shrink-0" style={{top: '50%', transform: 'translateY(-50%)'}} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setCurrentPage(1)
                                }}
                                placeholder="Search by problem title..."
                                className="w-full pl-10 pr-4 py-3 text-sm border border-white/15 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 transition-all hover:border-amber-300/40 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/40 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('')
                                        setCurrentPage(1)
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-amber-300 transition-colors"
                                >
                                    <X className="h-4 w-4 text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">Status</label>
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
                            <label className="block text-sm font-medium text-slate-300 mb-3">Difficulty</label>
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
                            <label className="block text-sm font-medium text-slate-300 mb-3">From Date</label>
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
                            <label className="block text-sm font-medium text-slate-300 mb-3">To Date</label>
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
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="flex items-center space-x-2 text-sm">
                                <span className="text-slate-400">Active filters:</span>
                                <div className="flex flex-wrap gap-2">
                                    {statusFilter !== 'All' && (
                                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-300/15 text-amber-200 border border-amber-300/30">
                                            Status: {statusFilter}
                                            <button
                                                onClick={() => setStatusFilter('All')}
                                                className="ml-1.5 text-amber-300 hover:text-amber-100"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {difficultyFilter !== 'All' && (
                                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-300/15 text-emerald-200 border border-emerald-300/30">
                                            Difficulty: {difficultyFilter}
                                            <button
                                                onClick={() => setDifficultyFilter('All')}
                                                className="ml-1.5 text-emerald-300 hover:text-emerald-100"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {searchQuery && (
                                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-300/15 text-blue-200 border border-blue-300/30">
                                            Search: {searchQuery}
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="ml-1.5 text-blue-300 hover:text-blue-100"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {(dateFromFilter || dateToFilter) && (
                                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-300/15 text-orange-200 border border-orange-300/30">
                                            Date: {dateFromFilter && new Date(dateFromFilter).toLocaleDateString()}
                                            {dateFromFilter && dateToFilter && ' - '}
                                            {dateToFilter && new Date(dateToFilter).toLocaleDateString()}
                                            <button
                                                onClick={() => {
                                                    setDateFromFilter('')
                                                    setDateToFilter('')
                                                }}
                                                className="ml-1.5 text-orange-300 hover:text-orange-100"
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
                    <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-8 text-center shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        <div className="text-red-400 mb-4">
                            <AlertTriangle className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-2">Error Loading Problems</h3>
                        <p className="text-slate-400 mb-6">{error}</p>
                        <button
                            onClick={fetchProblems}
                            className="px-6 py-2.5 bg-amber-300/20 text-amber-200 border border-amber-300/40 rounded-xl hover:bg-amber-300/30 hover:border-amber-300/60 transition-all font-medium text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                ) : problems.length === 0 ? (
                    <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-12 text-center shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        <div className="text-slate-400 mb-6">
                            <Compass className="w-20 h-20 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-2">No problems found</h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            {statusFilter !== 'All' || difficultyFilter !== 'All' || platformFilter !== 'All'
                                ? 'Try adjusting your filters or add some problems to get started.'
                                : 'Start tracking your DSA journey by adding your first problem.'
                            }
                        </p>
                        <Link
                            to="/dsa/add"
                            className="inline-flex items-center px-6 py-3 bg-amber-300/20 text-amber-200 border border-amber-300/40 rounded-xl hover:bg-amber-300/30 hover:border-amber-300/60 transition-all font-medium"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Your First Problem
                        </Link>
                    </div>
                ) : (
                    <div className="relative z-10 rounded-3xl border border-white/15 bg-slate-900/55 overflow-hidden shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10">
                                <thead>
                                    <tr className="bg-slate-800/50 border-b border-white/10">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Problem
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Difficulty
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Date Solved
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Revisions
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {problems.map((userProblem) => {
                                        const problem = userProblem.problemId as any
                                        return (
                                            <tr key={userProblem._id} className="hover:bg-white/5 transition-colors border-b border-white/10">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-semibold text-slate-100 mb-2 flex items-center">
                                                            <span className="mr-2">
                                                                {problem.platform === 'gfg' ? <img src="/GFG.png" alt="GeeksforGeeks" className="w-6 h-6 rounded-full" /> : <img src="/Leetcode.png" alt="LeetCode" className="w-6 h-6 rounded-full" />}
                                                            </span>
                                                            <Link to={`/dsa/problems/${userProblem._id}`} className="hover:text-amber-300 transition-colors">
                                                                {problem.title}
                                                            </Link>
                                                        </div>
                                                        {problem.topicTags && problem.topicTags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {problem.topicTags.slice(0, 3).map((tag: any) => (
                                                                    <span key={tag.slug} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg border border-white/10">
                                                                        {tag.name}
                                                                    </span>
                                                                ))}
                                                                {problem.topicTags.length > 3 && (
                                                                    <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg border border-white/10">
                                                                        +{problem.topicTags.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg ${
                                                        problem.difficulty === 'Easy'
                                                            ? 'bg-emerald-300/15 text-emerald-200 border border-emerald-300/30'
                                                            : problem.difficulty === 'Medium'
                                                            ? 'bg-orange-300/15 text-orange-200 border border-orange-300/30'
                                                            : 'bg-red-300/15 text-red-200 border border-red-300/30'
                                                    }`}>
                                                        {problem.difficulty === 'Easy' && '🟢'}
                                                        {problem.difficulty === 'Medium' && '🟡'}
                                                        {problem.difficulty === 'Hard' && '🔴'}
                                                        <span className="ml-1.5">{problem.difficulty}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusUpdate(userProblem._id, userProblem.status === 'Todo' ? 'Completed' : 'Todo')}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300/60 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                                                userProblem.status === 'Completed'
                                                                    ? 'bg-emerald-500/30 border border-emerald-300/40'
                                                                    : 'bg-slate-600/30 border border-white/10'
                                                            }`}
                                                            role="switch"
                                                            aria-checked={userProblem.status === 'Completed'}
                                                            title={`Toggle to ${userProblem.status === 'Todo' ? 'Completed' : 'Todo'}`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                    userProblem.status === 'Completed' ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                            />
                                                        </button>
                                                        {userProblem.status === 'Completed' ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-slate-500" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-300">
                                                    {userProblem.date_solved
                                                        ? new Date(userProblem.date_solved).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <button
                                                        onClick={() => handleRevisionClick(userProblem)}
                                                        className="flex items-center hover:text-amber-300 transition-colors cursor-pointer text-slate-400"
                                                        title="View revision history"
                                                    >
                                                        <Flame className="w-4 h-4 text-slate-400 mr-2" />
                                                        <span className="font-semibold">{userProblem.revision_history.length}</span>
                                                        <ChevronRight className="w-3 h-3 ml-1 text-slate-500" />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            to={`/dsa/problems/${userProblem._id}`}
                                                            className="p-2 text-slate-400 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-all"
                                                            title="View Problem Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <a
                                                            href={problem.problemUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-all"
                                                            title="Open on Platform"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteClick(userProblem)}
                                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                                                            title="Delete Problem"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                    <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-6 mt-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-slate-300">
                                Showing <span className="font-semibold text-slate-100">{((currentPage - 1) * 10) + 1}</span> to{' '}
                                <span className="font-semibold text-slate-100">{Math.min(currentPage * 10, pagination.totalItems)}</span> of{' '}
                                <span className="font-semibold text-slate-100">{pagination.totalItems}</span> problems
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="p-2 text-slate-300 border border-white/15 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all hover:border-amber-300/40 disabled:border-white/10"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <ChevronLeft className="w-4 h-4 -ml-2" />
                                </button>

                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm text-slate-300 border border-white/15 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all hover:border-amber-300/40 disabled:border-white/10"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
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
                                                className={`px-3 py-2 text-sm border rounded-lg transition-all ${
                                                    currentPage === page
                                                        ? 'bg-amber-300/20 text-amber-200 border-amber-300/40'
                                                        : 'text-slate-300 border-white/15 hover:bg-white/5 hover:border-amber-300/40'
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
                                    className="px-3 py-2 text-sm text-slate-300 border border-white/15 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all hover:border-amber-300/40 disabled:border-white/10"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </button>

                                <button
                                    onClick={() => setCurrentPage(pagination.totalPages)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="p-2 text-slate-300 border border-white/15 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all hover:border-amber-300/40 disabled:border-white/10"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                    <ChevronRight className="w-4 h-4 -ml-2" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Revision Modal */}
                {revisionModalOpen && selectedProblem && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="rounded-3xl border border-white/15 bg-slate-900/95 shadow-[0_40px_80px_rgba(2,6,23,0.75)] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
                                        <Flame className="w-6 h-6 text-amber-300" />
                                        Revision History
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {(selectedProblem.problemId as any).title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setRevisionModalOpen(false)
                                        setSelectedProblem(null)
                                        setNewRevisionNote('')
                                    }}
                                    className="text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-white/5 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto h-[40vh] px-6 py-6">
                                {selectedProblem.revision_history.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="text-slate-500 mb-4">
                                            <BookOpen className="w-16 h-16 mx-auto" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-200 mb-2">No revisions yet</h3>
                                        <p className="text-slate-400">Start tracking your revision notes for this problem.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedProblem.revision_history
                                            .sort((a, b) => b.revision_no - a.revision_no)
                                            .map((revision) => (
                                                <div key={revision.revision_no} className="bg-slate-800/50 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                                                            <Flame className="w-4 h-4" />
                                                            Revision #{revision.revision_no}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(revision.revision_date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                        {revision.revision_notes}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {/* Add New Revision Section */}
                            <div className="px-6 py-5 border-t border-white/10 bg-slate-800/30">
                                <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-amber-300" />
                                    Add New Revision
                                </h3>
                                <div className="space-y-3">
                                    <textarea
                                        value={newRevisionNote}
                                        onChange={(e) => setNewRevisionNote(e.target.value)}
                                        placeholder="What did you learn or improve in this revision?&#10;&#10;Example:&#10;- Optimized the approach from O(n²) to O(n)&#10;- Better understood the two-pointer technique&#10;- Fixed edge case with empty arrays"
                                        rows={6}
                                        className="w-full px-4 py-3 border border-white/15 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/40 focus:outline-none resize-none text-sm transition-all"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            Track your learning progress and improvements
                                        </span>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setRevisionModalOpen(false)
                                                    setSelectedProblem(null)
                                                    setNewRevisionNote('')
                                                }}
                                                className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddRevision}
                                                disabled={!newRevisionNote.trim() || addingRevision}
                                                className="px-4 py-2 text-sm bg-amber-300/20 text-amber-200 border border-amber-300/40 rounded-lg hover:bg-amber-300/30 hover:border-amber-300/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center font-medium"
                                            >
                                                {addingRevision ? (
                                                    <>
                                                        <div className="w-4 h-4 mr-2 border-2 border-amber-300/40 border-t-amber-300 rounded-full animate-spin" />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4 mr-2" />
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
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="rounded-3xl border border-white/15 bg-slate-900/95 shadow-[0_40px_80px_rgba(2,6,23,0.75)] max-w-md w-full overflow-hidden">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-white/10">
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mr-4 border border-red-500/30">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-50">Delete Problem</h3>
                                        <p className="text-sm text-slate-400 mt-1">This action cannot be undone</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="px-6 py-5">
                                <p className="text-slate-300 mb-4">
                                    Are you sure you want to remove <span className="font-semibold text-slate-100">"{(problemToDelete.problemId as any).title}"</span> from your tracking list?
                                </p>
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                    <div className="flex items-start">
                                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div className="text-sm text-red-300">
                                            <p className="font-semibold mb-2">This will permanently delete:</p>
                                            <ul className="space-y-1 text-red-200/90">
                                                <li>• Your progress tracking for this problem</li>
                                                <li>• All revision notes ({problemToDelete.revision_history.length} revisions)</li>
                                                <li>• Your solution notes and completion status</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="px-6 py-4 border-t border-white/10 bg-slate-800/30 flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setDeleteModalOpen(false)
                                        setProblemToDelete(null)
                                    }}
                                    disabled={deleting}
                                    className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={deleting}
                                    className="px-4 py-2 text-sm bg-red-500/20 text-red-200 border border-red-500/30 rounded-lg hover:bg-red-500/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center font-medium"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
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
