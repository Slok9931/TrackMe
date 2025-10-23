import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import DSAApiService from '../services/dsaApi'
import type { UserProblem } from '../services/dsaApi'

// Custom CSS for problem content styling and resizable panels
const customStyles = `
.resize-handle {
    width: 4px;
    background-color: #e5e7eb;
    position: relative;
    z-index: 10;
    flex-shrink: 0;
    transition: all 0.2s ease-in-out;
}

.resize-handle:hover {
    background-color: #3b82f6;
    width: 6px;
}

.resize-handle:active {
    background-color: #1d4ed8;
    width: 6px;
}

.resizable-panel {
    min-width: 200px;
    max-width: 70%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.resizable-panel.minimized {
    min-width: 40px !important;
    max-width: 60px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.problem-content pre {
    background-color: #f9fafb !important;
    border: 1px solid #e5e7eb !important;
    color: #374151 !important;
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    line-height: 1.6 !important;
}

.problem-content pre strong {
    color: #111827 !important;
    font-weight: 600 !important;
}

.problem-content pre code {
    background: transparent !important;
    padding: 0 !important;
    color: inherit !important;
    font-size: 0.875rem !important;
}

.problem-content code:not(pre code) {
    background-color: #f0fdf4 !important;
    color: #15803d !important;
    padding: 0.125rem 0.375rem !important;
    border-radius: 0.25rem !important;
    font-size: 0.875rem !important;
}

.problem-content blockquote {
    border-left: 4px solid #3b82f6 !important;
    padding-left: 1rem !important;
    margin: 1rem 0 !important;
    font-style: italic !important;
    color: #6b7280 !important;
}

.problem-content table {
    border-collapse: collapse !important;
    width: 100% !important;
    margin: 1rem 0 !important;
}

.problem-content th,
.problem-content td {
    border: 1px solid #d1d5db !important;
    padding: 0.5rem 0.75rem !important;
    text-align: left !important;
}

.problem-content th {
    background-color: #f9fafb !important;
    font-weight: 600 !important;
    color: #111827 !important;
}

.problem-content td {
    color: #374151 !important;
}

.problem-content ul,
.problem-content ol {
    margin: 1rem 0 !important;
    padding-left: 1.5rem !important;
}

.problem-content li {
    margin-bottom: 0.25rem !important;
    line-height: 1.6 !important;
    color: #374151 !important;
}

.problem-content p {
    margin-bottom: 1rem !important;
    line-height: 1.6 !important;
    color: #374151 !important;
}

.problem-content h1,
.problem-content h2,
.problem-content h3,
.problem-content h4,
.problem-content h5,
.problem-content h6 {
    color: #111827 !important;
    font-weight: 600 !important;
    margin-top: 1.5rem !important;
    margin-bottom: 0.75rem !important;
}

.problem-content h1 { font-size: 1.5rem !important; }
.problem-content h2 { font-size: 1.25rem !important; }
.problem-content h3 { font-size: 1.125rem !important; }
`

const ProblemDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()

    const [userProblem, setUserProblem] = useState<UserProblem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Edit states
    const [editData, setEditData] = useState({
        status: 'Todo' as 'Todo' | 'Completed',
        notes: ''
    })

    // Resizable panel states
    const [panelWidths, setPanelWidths] = useState([33.33, 33.33, 33.34])
    const [isResizing, setIsResizing] = useState(false)
    const [resizePanel, setResizePanel] = useState<number | null>(null)
    const [minimizedPanels, setMinimizedPanels] = useState<boolean[]>([false, false, false])

    useEffect(() => {
        if (id) {
            fetchProblemDetail()
        }
    }, [id])

    // Resize functionality
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || resizePanel === null) return

            const container = document.querySelector('.resize-container') as HTMLElement
            if (!container) return

            const containerRect = container.getBoundingClientRect()
            const mouseX = e.clientX - containerRect.left
            const containerWidth = containerRect.width
            const mousePercentage = (mouseX / containerWidth) * 100

            const newWidths = [...panelWidths]
            const visiblePanels = minimizedPanels.map((minimized, index) => ({ index, minimized }))
                .filter(panel => !panel.minimized)

            if (visiblePanels.length < 2) return

            if (resizePanel === 0 && !minimizedPanels[0] && !minimizedPanels[1]) {
                // Resizing between panel 0 and 1
                const minWidth = 10
                const maxWidth = 90
                const newPanel0Width = Math.max(minWidth, Math.min(maxWidth, mousePercentage))
                const remainingWidth = 100 - newPanel0Width

                if (!minimizedPanels[2]) {
                    const panel1Ratio = panelWidths[1] / (panelWidths[1] + panelWidths[2])
                    newWidths[0] = newPanel0Width
                    newWidths[1] = remainingWidth * panel1Ratio
                    newWidths[2] = remainingWidth * (1 - panel1Ratio)
                } else {
                    newWidths[0] = newPanel0Width
                    newWidths[1] = remainingWidth
                    newWidths[2] = 0
                }
            } else if (resizePanel === 1 && !minimizedPanels[1] && !minimizedPanels[2]) {
                // Resizing between panel 1 and 2
                const panel0Width = minimizedPanels[0] ? 0 : panelWidths[0]
                const remainingWidth = 100 - panel0Width
                const minWidth = 10
                const maxWidth = remainingWidth - 10

                const panel1RelativePos = mousePercentage - panel0Width
                const newPanel1Width = Math.max(minWidth, Math.min(maxWidth, panel1RelativePos))
                const newPanel2Width = remainingWidth - newPanel1Width

                newWidths[1] = newPanel1Width
                newWidths[2] = newPanel2Width
            }

            setPanelWidths(newWidths)
        }

        const handleMouseUp = () => {
            setIsResizing(false)
            setResizePanel(null)
        }

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing, resizePanel, panelWidths])

    const handleResizeStart = (panelIndex: number) => {
        setIsResizing(true)
        setResizePanel(panelIndex)
    }

    const togglePanelMinimized = (panelIndex: number) => {
        const newMinimizedPanels = [...minimizedPanels]
        newMinimizedPanels[panelIndex] = !newMinimizedPanels[panelIndex]

        setMinimizedPanels(newMinimizedPanels)

        // Recalculate panel widths
        const newWidths = [...panelWidths]
        const minimizedWidth = 1.5 // 1.5% width for minimized panels

        // Count total minimized panels
        const minimizedCount = newMinimizedPanels.filter(Boolean).length
        const totalMinimizedWidth = minimizedCount * minimizedWidth
        const availableWidth = 100 - totalMinimizedWidth

        // Count visible (non-minimized) panels
        const visiblePanelIndices = newMinimizedPanels
            .map((minimized, index) => ({ index, minimized }))
            .filter(panel => !panel.minimized)
            .map(panel => panel.index)

        // Set minimized panels to small width
        newMinimizedPanels.forEach((minimized, index) => {
            if (minimized) {
                newWidths[index] = minimizedWidth
            }
        })

        // Distribute remaining width among visible panels
        if (visiblePanelIndices.length > 0) {
            const widthPerVisiblePanel = availableWidth / visiblePanelIndices.length
            visiblePanelIndices.forEach(index => {
                newWidths[index] = widthPerVisiblePanel
            })
        }

        setPanelWidths(newWidths)
    }

    const fetchProblemDetail = async () => {
        try {
            setLoading(true)
            setError(null)

            // Get single problem by fetching all and filtering (since we don't have a single endpoint)
            const response = await DSAApiService.getUserProblems({ limit: 1000 })
            const problem = response.userProblems.find(p => p._id === id)

            if (!problem) {
                setError('Problem not found')
                return
            }

            setUserProblem(problem)
            setEditData({
                status: problem.status,
                notes: problem.notes
            })

        } catch (error: any) {
            console.error('Error fetching problem:', error)
            setError('Failed to load problem details')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!userProblem) return

        try {
            await DSAApiService.updateUserProblem(userProblem._id, editData)
            fetchProblemDetail()
        } catch (error: any) {
            console.error('Error updating problem:', error)
            alert('Failed to update problem')
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

    const getStatusColor = (status: string) => {
        return status === 'Completed'
            ? 'text-green-600 bg-green-50 border-green-200'
            : 'text-gray-600 bg-gray-50 border-gray-200'
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

    if (error || !userProblem) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Problem Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'The requested problem could not be found.'}</p>
                    <Link
                        to="/dsa/problems"
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Back to Problems
                    </Link>
                </div>
            </div>
        )
    }

    const problem = userProblem.problemId as any

    return (
        <div className="bg-gray-50">
            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />



            {/* Main Content Area */}
            <div className="flex h-[calc(92vh)] relative resize-container transition-all duration-300 ease-out">
                {/* Left Panel - Problem Description */}
                <div
                    className={`bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden m-2 border rounded-md resizable-panel transition-all duration-300 ease-in-out ${minimizedPanels[0] ? 'minimized' : ''}`}
                    style={{ width: `${panelWidths[0]}%` }}
                >
                    {minimizedPanels[0] ? (
                        /* Minimized State */
                        <div className="h-full flex flex-col bg-gray-50 transition-all duration-300 ease-in-out">
                            <button
                                onClick={() => togglePanelMinimized(0)}
                                className="p-2 hover:bg-gray-200 transition-all duration-200 border-b border-gray-200"
                                title="Expand Problem Description panel"
                            >
                                <svg className="w-4 h-4 text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="writing-mode-vertical text-xs text-gray-500 font-medium transform -rotate-90 whitespace-nowrap">
                                    Problem Description
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Expanded State */
                        <>
                            <div className="p-6">
                                {/* Problem Info */}
                                <div className="flex items-center justify-between space-x-3 mb-6">
                                    <div className="flex items-center space-x-3">
                                        <h1 className="text-2xl font-semibold text-gray-900">{problem.title}</h1>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(userProblem.status)}`}>
                                            {userProblem.status}
                                        </span>
                                        <button
                                            onClick={() => togglePanelMinimized(0)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            title="Minimize panel"
                                        >
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    {problem.topicTags && problem.topicTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {problem.topicTags.map((tag: any) => (
                                                <span key={tag.slug} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {userProblem.date_solved && (
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-600 text-sm mb-2">
                                                <strong>Solved:</strong> {new Date(userProblem.date_solved).toLocaleDateString()}
                                            </p>
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
                                        </div>
                                    )}
                                </div>

                                {/* Problem Description */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                                    {problem.content ? (
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
                                            dangerouslySetInnerHTML={{ __html: problem.content }}
                                        />
                                    ) : (
                                        <p className="text-gray-500 italic">Problem description not available</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Resize Handle 1 */}
                {!minimizedPanels[0] && !minimizedPanels[1] && (
                    <div
                        className="resize-handle cursor-col-resize transition-colors"
                        onMouseDown={() => handleResizeStart(0)}
                    ></div>
                )}

                {/* Middle Panel - Markdown Editor */}
                <div
                    className={`border-gray-200 flex flex-col m-2 border rounded-md resizable-panel overflow-x-hidden transition-all duration-300 ease-in-out ${minimizedPanels[1] ? 'minimized' : ''}`}
                    style={{ width: `${panelWidths[1]}%` }}
                >
                    {minimizedPanels[1] ? (
                        /* Minimized State */
                        <div className="h-full flex flex-col bg-gray-50 transition-all duration-300 ease-in-out">
                            <button
                                onClick={() => togglePanelMinimized(1)}
                                className="p-2 hover:bg-gray-200 transition-all duration-200 border-b border-gray-200"
                                title="Expand Notes & Solution panel"
                            >
                                <svg className="w-4 h-4 text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-xs text-gray-500 font-medium transform -rotate-90 whitespace-nowrap">
                                    Notes & Solution
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Expanded State */
                        <>
                            {/* Editor Header */}
                            <div className="bg-white px-4 py-3 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-medium text-gray-900">Notes & Solution</h2>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => togglePanelMinimized(1)}
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            title="Minimize panel"
                                        >
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-600">Status:</span>
                                            <button
                                                type="button"
                                                onClick={() => setEditData(prev => ({
                                                    ...prev,
                                                    status: prev.status === 'Todo' ? 'Completed' : 'Todo'
                                                }))}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${editData.status === 'Completed' ? 'bg-green-500' : 'bg-gray-200'
                                                    }`}
                                                role="switch"
                                                aria-checked={editData.status === 'Completed'}
                                                title={`Toggle to ${editData.status === 'Todo' ? 'Completed' : 'Todo'}`}
                                            >
                                                <span
                                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${editData.status === 'Completed' ? 'translate-x-5' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                            <span className={`text-xs font-medium ${editData.status === 'Completed' ? 'text-green-600' : 'text-orange-600'}`}>
                                                {editData.status === 'Completed' ? '✅' : '📋'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Markdown Toolbar */}
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex items-center space-x-1">
                                        <span className="text-xs font-medium text-gray-600 mr-2">Format:</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const textarea = document.querySelector('#notes-textarea') as HTMLTextAreaElement
                                                if (textarea) {
                                                    const start = textarea.selectionStart
                                                    const end = textarea.selectionEnd
                                                    const text = '**Bold**'
                                                    const newValue = editData.notes.substring(0, start) + text + editData.notes.substring(end)
                                                    setEditData(prev => ({ ...prev, notes: newValue }))
                                                    setTimeout(() => {
                                                        textarea.focus()
                                                        textarea.setSelectionRange(start + text.length, start + text.length)
                                                    }, 0)
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold"
                                            title="Bold"
                                        >
                                            B
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const textarea = document.querySelector('#notes-textarea') as HTMLTextAreaElement
                                                if (textarea) {
                                                    const start = textarea.selectionStart
                                                    const end = textarea.selectionEnd
                                                    const text = '*Italic*'
                                                    const newValue = editData.notes.substring(0, start) + text + editData.notes.substring(end)
                                                    setEditData(prev => ({ ...prev, notes: newValue }))
                                                    setTimeout(() => {
                                                        textarea.focus()
                                                        textarea.setSelectionRange(start + text.length, start + text.length)
                                                    }, 0)
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 italic"
                                            title="Italic"
                                        >
                                            I
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const textarea = document.querySelector('#notes-textarea') as HTMLTextAreaElement
                                                if (textarea) {
                                                    const start = textarea.selectionStart
                                                    const end = textarea.selectionEnd
                                                    const text = '`code`'
                                                    const newValue = editData.notes.substring(0, start) + text + editData.notes.substring(end)
                                                    setEditData(prev => ({ ...prev, notes: newValue }))
                                                    setTimeout(() => {
                                                        textarea.focus()
                                                        textarea.setSelectionRange(start + text.length, start + text.length)
                                                    }, 0)
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 font-mono"
                                            title="Inline Code"
                                        >
                                            {'</>'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const textarea = document.querySelector('#notes-textarea') as HTMLTextAreaElement
                                                if (textarea) {
                                                    const start = textarea.selectionStart
                                                    const end = textarea.selectionEnd
                                                    const text = '\n```\ncode block\n```\n'
                                                    const newValue = editData.notes.substring(0, start) + text + editData.notes.substring(end)
                                                    setEditData(prev => ({ ...prev, notes: newValue }))
                                                    setTimeout(() => {
                                                        textarea.focus()
                                                        textarea.setSelectionRange(start + text.length, start + text.length)
                                                    }, 0)
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                            title="Code Block"
                                        >
                                            {'{}'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const textarea = document.querySelector('#notes-textarea') as HTMLTextAreaElement
                                                if (textarea) {
                                                    const start = textarea.selectionStart
                                                    const end = textarea.selectionEnd
                                                    const text = '\n- List item\n'
                                                    const newValue = editData.notes.substring(0, start) + text + editData.notes.substring(end)
                                                    setEditData(prev => ({ ...prev, notes: newValue }))
                                                    setTimeout(() => {
                                                        textarea.focus()
                                                        textarea.setSelectionRange(start + text.length, start + text.length)
                                                    }, 0)
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                            title="List"
                                        >
                                            •
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const textarea = document.querySelector('#notes-textarea') as HTMLTextAreaElement
                                                if (textarea) {
                                                    const start = textarea.selectionStart
                                                    const end = textarea.selectionEnd
                                                    const text = '\n## Heading\n'
                                                    const newValue = editData.notes.substring(0, start) + text + editData.notes.substring(end)
                                                    setEditData(prev => ({ ...prev, notes: newValue }))
                                                    setTimeout(() => {
                                                        textarea.focus()
                                                        textarea.setSelectionRange(start + text.length, start + text.length)
                                                    }, 0)
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold"
                                            title="Heading"
                                        >
                                            H
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Editor Content */}
                            <div className="flex-1 overflow-y-auto">
                                <textarea
                                    id="notes-textarea"
                                    value={editData.notes}
                                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
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
2. Optimized: O(n log n)

## Learning Points
- What did I learn from this problem?
- Similar problems to practice

## Resources
- [Problem Link](https://leetcode.com/problems/...)
- Helpful articles or videos"
                                    className="w-full h-full p-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none font-mono text-sm leading-relaxed border-0"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Resize Handle 2 */}
                {!minimizedPanels[1] && !minimizedPanels[2] && (
                    <div
                        className="resize-handle cursor-col-resize hover:bg-blue-300 transition-colors"
                        onMouseDown={() => handleResizeStart(1)}
                    ></div>
                )}

                {/* Right Panel - Preview */}
                <div
                    className={`bg-white overflow-y-auto m-2 border rounded-md resizable-panel overflow-x-hidden transition-all duration-300 ease-in-out ${minimizedPanels[2] ? 'minimized' : ''}`}
                    style={{ width: `${panelWidths[2]}%` }}
                >
                    {minimizedPanels[2] ? (
                        /* Minimized State */
                        <div className="h-full flex flex-col bg-gray-50 transition-all duration-300 ease-in-out">
                            <button
                                onClick={() => togglePanelMinimized(2)}
                                className="p-2 hover:bg-gray-200 transition-all duration-200 border-b border-gray-200"
                                title="Expand Preview panel"
                            >
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-xs text-gray-500 font-medium transform -rotate-90 whitespace-nowrap">
                                    Preview
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Expanded State */
                        <>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={handleUpdate}
                                            className={`px-4 py-2 text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600'
                                                }`}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => togglePanelMinimized(2)}
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            title="Minimize panel"
                                        >
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Markdown Preview */}
                                <div className="mb-8">
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
                                        dangerouslySetInnerHTML={{
                                            __html: marked(editData.notes)
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProblemDetail
