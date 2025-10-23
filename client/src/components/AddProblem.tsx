import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import DSAApiService from '../services/dsaApi'

// Custom Date Picker Component
interface CustomDatePickerProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    required?: boolean
    disabled?: boolean
    className?: string
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    value,
    onChange,
    placeholder = "Select date",
    disabled,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (value) {
            return new Date(value)
        }
        return new Date()
    })

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const generateCalendar = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDay = new Date(year, month, 1)
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())

        const days = []
        const today = new Date()
        const selectedDate = value ? new Date(value) : null

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate)
            date.setDate(startDate.getDate() + i)

            const isCurrentMonth = date.getMonth() === month
            const isToday = date.toDateString() === today.toDateString()
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

            days.push({
                date: new Date(date),
                day: date.getDate(),
                isCurrentMonth,
                isToday,
                isSelected
            })
        }

        return days
    }

    const handleDateSelect = (date: Date) => {
        // Format date as YYYY-MM-DD in local timezone to avoid timezone offset issues
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const isoString = `${year}-${month}-${day}`
        onChange(isoString)
        setIsOpen(false)
    }

    const navigateMonth = (direction: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev)
            newDate.setMonth(prev.getMonth() + direction)
            return newDate
        })
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    if (disabled) {
        return (
            <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-400 ${className}`}>
                {value ? formatDate(value) : placeholder}
            </div>
        )
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 text-left flex items-center justify-between bg-white ${className}`}
            >
                <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                    {value ? formatDate(value) : placeholder}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    style={{ zIndex: 9999 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigateMonth(-1)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button
                            type="button"
                            onClick={() => navigateMonth(1)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-4">
                        {/* Day Labels */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {generateCalendar().map((dayInfo, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleDateSelect(dayInfo.date)}
                                    className={`
                                        p-2 text-sm rounded-lg relative
                                        ${dayInfo.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                                        ${dayInfo.isSelected ? 'bg-green-500 text-white' : 'hover:bg-gray-100'}
                                        ${dayInfo.isToday && !dayInfo.isSelected ? 'bg-green-50 text-green-600 font-semibold' : ''}
                                    `}
                                >
                                    {dayInfo.day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('')
                                setIsOpen(false)
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Clear
                        </button>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date()
                                    handleDateSelect(today)
                                }}
                                className="px-3 py-1 text-sm text-green-600 hover:text-green-700"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    )
}

const AddProblem: React.FC = () => {
    const [formData, setFormData] = useState({
        titleSlug: '',
        status: 'Todo' as 'Todo' | 'Completed',
        notes: '',
        date_solved: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const navigate = useNavigate()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const extractTitleSlugFromUrl = (url: string): string | null => {
        try {
            const regex = /https:\/\/leetcode\.com\/problems\/([a-z0-9-]+)\/?/
            const match = url.match(regex)
            return match ? match[1] : null
        } catch {
            return null
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        if (name === 'titleSlug') {
            // If it looks like a URL, extract the titleSlug
            const extracted = extractTitleSlugFromUrl(value)
            if (extracted) {
                setFormData(prev => ({ ...prev, [name]: extracted }))
            } else {
                setFormData(prev => ({ ...prev, [name]: value }))
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const insertText = (text: string) => {
        if (textareaRef.current) {
            const textarea = textareaRef.current
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const currentValue = formData.notes
            const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)

            setFormData(prev => ({ ...prev, notes: newValue }))

            // Set cursor position after the inserted text
            setTimeout(() => {
                if (textarea) {
                    textarea.focus()
                    textarea.setSelectionRange(start + text.length, start + text.length)
                }
            }, 0)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.titleSlug.trim()) {
            setError('Please enter a problem title slug or URL')
            return
        }

        if (formData.status === 'Completed' && !formData.date_solved) {
            setError('Please specify the date when you solved this problem')
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const submitData: any = {
                titleSlug: formData.titleSlug.trim(),
                status: formData.status,
                notes: formData.notes || ''
            }

            // Include date_solved if status is Completed
            if (formData.status === 'Completed') {
                submitData.date_solved = formData.date_solved
            }

            await DSAApiService.addUserProblem(submitData)

            setSuccess(true)
            setFormData({
                titleSlug: '',
                status: 'Todo',
                notes: '',
                date_solved: ''
            })

            // Redirect to problems list after 2 seconds
            setTimeout(() => {
                navigate('/dsa/problems')
            }, 2000)

        } catch (error: any) {
            console.error('Error adding problem:', error)
            if (error.response?.data?.error) {
                setError(error.response.data.error)
            } else {
                setError('Failed to add problem. Please check if the problem exists on LeetCode.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gray-50">

            {/* Main Content */}
            <main className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Top Section - Form Fields */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Problem</h2>
                        <p className="text-gray-600">
                            Add a problem to your tracking list using the LeetCode problem URL.
                        </p>
                    </div>

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-green-700 font-medium">
                                    Problem added successfully! Redirecting to problems list...
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Problem URL */}
                            <div className='col-span-2'>
                                <label htmlFor="titleSlug" className="block text-sm font-medium text-gray-700 mb-2">
                                    Problem URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="titleSlug"
                                    name="titleSlug"
                                    value={formData.titleSlug}
                                    onChange={handleInputChange}
                                    placeholder="e.g., set-matrix-zeroes or https://leetcode.com/problems/set-matrix-zeroes/"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-2 focus:border-green-500 focus:outline-none"
                                    required
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    You can paste the full LeetCode URL
                                </p>
                            </div>

                            {/* Status Toggle Switch */}
                            <div className='mx-auto'>
                                <label className="block text-sm font-medium text-gray-700 text-center mb-3">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center flex-col gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            status: prev.status === 'Todo' ? 'Completed' : 'Todo',
                                            // Clear date_solved when switching to Todo
                                            date_solved: prev.status === 'Todo' ? prev.date_solved : ''
                                        }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${formData.status === 'Completed' ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                        role="switch"
                                        aria-checked={formData.status === 'Completed'}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.status === 'Completed' ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                    {formData.status === 'Completed' ? <span className={`text-sm font-medium ${formData.status === 'Completed' ? 'text-green-600' : 'text-gray-500'}`}>
                                        ✅ Completed
                                    </span> : <span className={`text-sm font-medium ${formData.status === 'Todo' ? 'text-orange-600' : 'text-gray-500'}`}>
                                        📋 Todo
                                    </span>}
                                </div>
                            </div>

                            {/* Date Solved */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date Solved {formData.status === 'Completed' && <span className="text-red-500">*</span>}
                                </label>
                                <CustomDatePicker
                                    value={formData.date_solved}
                                    onChange={(value) => setFormData(prev => ({ ...prev, date_solved: value }))}
                                    placeholder="Select date solved"
                                    required={formData.status === 'Completed'}
                                    disabled={formData.status === 'Todo'}
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    {formData.status === 'Completed'
                                        ? 'When you solved it'
                                        : 'Available when completed'
                                    }
                                </p>
                            </div>

                        </div>

                        {/* Bottom Section - Markdown Editor and Preview */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Markdown Editor */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">✍️ Write Notes</h3>
                                    <p className="text-sm text-gray-600">
                                        Document your approach, insights, and learning points in Markdown
                                    </p>
                                </div>

                                <div className="space-y-0">
                                    {/* Markdown Toolbar */}
                                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-b border-gray-200">
                                        <div className="flex items-center space-x-1">
                                            <span className="text-xs font-medium text-gray-600 mr-2">Format:</span>
                                            <button
                                                type="button"
                                                onClick={() => insertText('**Bold**')}
                                                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold"
                                                title="Bold"
                                            >
                                                B
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertText('*Italic*')}
                                                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 italic"
                                                title="Italic"
                                            >
                                                I
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertText('`code`')}
                                                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 font-mono"
                                                title="Inline Code"
                                            >
                                                {'</>'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertText('\n```\ncode block\n```\n')}
                                                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                                title="Code Block"
                                            >
                                                {'{}'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertText('\n- List item\n')}
                                                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                                title="List"
                                            >
                                                •
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertText('\n## Heading\n')}
                                                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold"
                                                title="Heading"
                                            >
                                                H
                                            </button>
                                        </div>
                                    </div>

                                    {/* Markdown Textarea */}
                                    <textarea
                                        ref={textareaRef}
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={20}
                                        className="notes-editor w-full px-4 py-4 focus:ring-2 focus:ring-green-500 rounded-b-md focus:outline-none resize-none font-mono text-sm leading-relaxed border-0"
                                        placeholder="## Approach
- Describe your solution strategy
- Time: O(n), Space: O(1)

## Key Insights
- Important observations
- **Edge cases** to consider

```python
def solution(nums):
    # Your implementation
    pass
```

## Alternative Solutions
1. Brute force: O(n²)
2. Optimized: O(n log n)"
                                    />
                                </div>
                            </div>

                            {/* Right Column - Live Preview */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">�️ Live Preview</h3>
                                    <p className="text-sm text-gray-600">
                                        See how your markdown will be rendered
                                    </p>
                                </div>

                                <div className="p-6 h-[500px] overflow-y-auto">
                                    {formData.notes.trim() ? (
                                        <div
                                            className="problem-content prose prose-sm max-w-none 
                                        prose-headings:text-gray-900 prose-headings:font-semibold
                                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                                        prose-strong:text-gray-900 prose-strong:font-semibold
                                        prose-em:text-gray-700 prose-em:italic
                                        prose-code:text-green-700 prose-code:bg-green-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                        prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                                        prose-pre:text-gray-800 prose-pre:text-sm prose-pre:leading-relaxed prose-pre:whitespace-pre-wrap
                                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                                        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ul:text-gray-700
                                        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4 prose-ol:text-gray-700
                                        prose-li:mb-1 prose-li:leading-relaxed
                                        prose-table:border-collapse prose-table:w-full prose-table:mb-4
                                        prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900
                                        prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 prose-td:text-gray-700 prose-a:text-green-700 prose-a:mr-1"
                                            dangerouslySetInnerHTML={{ __html: marked(formData.notes) }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <div className="text-center">
                                                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-sm">Start writing to see the preview</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <Link
                                to="/dsa/problems"
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding Problem...
                                    </>
                                ) : (
                                    'Add Problem'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default AddProblem
