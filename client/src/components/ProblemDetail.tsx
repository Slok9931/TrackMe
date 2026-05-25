import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    Code2,
    ExternalLink,
    FileText,
    Tag,
    Target,
} from 'lucide-react'
import DSAApiService from '../services/dsaApi'
import type { UserProblem } from '../services/dsaApi'
import { LoadingState } from './problems/LoadingState'
import ProblemEditorWorkspace from './problems/ProblemEditorWorkspace'

const problemContentStyles = `
.problem-content {
    color: #cbd5e1;
}

.problem-content pre {
    background-color: rgba(2, 6, 23, 0.72) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 1rem !important;
    padding: 1rem !important;
    margin: 1rem 0 !important;
    color: #e2e8f0 !important;
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    line-height: 1.6 !important;
}

.problem-content pre strong {
    color: #f8fafc !important;
    font-weight: 600 !important;
}

.problem-content pre code {
    background: transparent !important;
    padding: 0 !important;
    color: inherit !important;
    font-size: 0.875rem !important;
}

.problem-content code:not(pre code) {
    background-color: rgba(251, 191, 36, 0.12) !important;
    color: #fde68a !important;
    padding: 0.125rem 0.375rem !important;
    border-radius: 0.375rem !important;
    font-size: 0.875rem !important;
}

.problem-content blockquote {
    border-left: 4px solid #f59e0b !important;
    padding-left: 1rem !important;
    margin: 1rem 0 !important;
    font-style: italic !important;
    color: #cbd5e1 !important;
}

.problem-content table {
    border-collapse: collapse !important;
    width: 100% !important;
    margin: 1rem 0 !important;
}

.problem-content th,
.problem-content td {
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    padding: 0.5rem 0.75rem !important;
    text-align: left !important;
}

.problem-content th {
    background-color: rgba(255, 255, 255, 0.05) !important;
    font-weight: 600 !important;
    color: #f8fafc !important;
}

.problem-content td {
    color: #cbd5e1 !important;
}

.problem-content ul,
.problem-content ol {
    margin: 1rem 0 !important;
    padding-left: 1.5rem !important;
}

.problem-content li {
    margin-bottom: 0.25rem !important;
    line-height: 1.6 !important;
    color: #cbd5e1 !important;
}

.problem-content p {
    margin-bottom: 1rem !important;
    line-height: 1.7 !important;
    color: #cbd5e1 !important;
}

.problem-content h1,
.problem-content h2,
.problem-content h3,
.problem-content h4,
.problem-content h5,
.problem-content h6 {
    color: #f8fafc !important;
    font-weight: 700 !important;
    margin-top: 1.5rem !important;
    margin-bottom: 0.75rem !important;
}

.problem-content h1 { font-size: 1.5rem !important; }
.problem-content h2 { font-size: 1.25rem !important; }
.problem-content h3 { font-size: 1.125rem !important; }

.problem-content span[style*="font-size: 14pt"] {
    font-size: 1rem !important;
}

.problem-content span[style*="color"] {
    color: inherit !important;
}

.problem-content strong,
.problem-content b {
    font-weight: 700 !important;
    color: #f8fafc !important;
}

.problem-content sup {
    font-size: 0.75em !important;
    vertical-align: super !important;
}

.problem-content sub {
    font-size: 0.75em !important;
    vertical-align: sub !important;
}

.problem-content div[style*="background"] {
    background-color: rgba(2, 6, 23, 0.72) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 1rem !important;
    padding: 1rem !important;
    margin: 1rem 0 !important;
    color: #e2e8f0 !important;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
    font-size: 0.875rem !important;
    line-height: 1.6 !important;
}
`

const ProblemDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()

    const [userProblem, setUserProblem] = useState<UserProblem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const [editData, setEditData] = useState({
        status: 'Todo' as 'Todo' | 'Completed',
        notes: '',
    })
    const [implementationCode, setImplementationCode] = useState('')
    const [aiLoading, setAiLoading] = useState(false)

    useEffect(() => {
        if (id) {
            void fetchProblemDetail()
        }
    }, [id])

    const fetchProblemDetail = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await DSAApiService.getUserProblems({ limit: 1000 })
            const problem = response.userProblems.find((item) => item._id === id)

            if (!problem) {
                setError('Problem not found')
                return
            }

            setUserProblem(problem)
            setEditData({
                status: problem.status,
                notes: problem.notes || '',
            })
        } catch (fetchError: any) {
            console.error('Error fetching problem:', fetchError)
            setError('Failed to load problem details')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!userProblem) return

        try {
            setSaving(true)
            await DSAApiService.updateUserProblem(userProblem._id, editData)
            await fetchProblemDetail()
        } catch (updateError: any) {
            console.error('Error updating problem:', updateError)
            alert('Failed to update problem')
        } finally {
            setSaving(false)
        }
    }

    const handleGenerateSummary = async () => {
        if (!implementationCode.trim()) {
            alert('Please paste implementation code first')
            return false
        }

        try {
            setAiLoading(true)
            const response = await DSAApiService.generateAiSummary(implementationCode, editData.notes)
            setEditData((previous) => ({
                ...previous,
                notes: previous.notes.trim()
                    ? `${response.summary}\n\n${previous.notes}`
                    : response.summary,
            }))
            return true
        } catch (generateError: any) {
            console.error('Error generating summary:', generateError)
            const errorMessage = generateError?.response?.data?.details || generateError?.response?.data?.error || generateError?.message || 'Failed to generate summary'
            alert(errorMessage)
            return false
        } finally {
            setAiLoading(false)
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
            case 'Medium':
                return 'border-amber-300/30 bg-amber-300/10 text-amber-100'
            case 'Hard':
                return 'border-rose-300/30 bg-rose-300/10 text-rose-100'
            default:
                return 'border-white/15 bg-white/5 text-slate-200'
        }
    }

    const getStatusColor = (status: string) => {
        return status === 'Completed'
            ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
            : 'border-slate-500/30 bg-slate-500/10 text-slate-200'
    }

    if (loading) {
        return <LoadingState />
    }

    if (error || !userProblem) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

                <div className="relative flex min-h-screen items-center justify-center p-6">
                    <div className="max-w-lg rounded-[2rem] border border-white/15 bg-slate-900/65 p-8 text-center shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/20 bg-red-300/10 text-red-200">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-50">Problem not found</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            {error || 'The requested problem could not be found.'}
                        </p>
                        <div className="mt-6 flex items-center justify-center">
                            <Link
                                to="/dsa/problems"
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-900/20 transition-all hover:bg-amber-200"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to Problems
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const problem = typeof userProblem.problemId === 'string' ? null : (userProblem.problemId as any)

    if (!problem) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
                <div className="relative flex min-h-screen items-center justify-center p-6">
                    <div className="max-w-lg rounded-[2rem] border border-white/15 bg-slate-900/65 p-8 text-center shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-50">Problem data unavailable</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            This user problem does not include a populated problem record.
                        </p>
                        <div className="mt-6 flex items-center justify-center">
                            <Link
                                to="/dsa/problems"
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-900/20 transition-all hover:bg-amber-200"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to Problems
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const topicTags = Array.isArray(problem.topicTags) ? problem.topicTags : []
    const sourceName = problem.platform === 'leetcode' ? 'LeetCode' : 'GeeksforGeeks'

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#07111f] text-slate-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
            <style dangerouslySetInnerHTML={{ __html: problemContentStyles }} />

            <main className="relative mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-10">
                <section className="rounded-[2rem] border border-white/15 bg-slate-900/55 p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-4xl">
                            <Link
                                to="/dsa/problems"
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-100"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to Problems
                            </Link>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                                    {sourceName === 'LeetCode' ? (
                                        <img src="/Leetcode.png" alt="LeetCode" className="h-3.5 w-3.5 text-amber-300" />
                                    ) : (
                                        <img src="/GFG.png" alt="GeeksforGeeks" className="h-3.5 w-3.5 text-amber-300" />
                                    )}
                                    {sourceName}
                                </div>
                                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${getDifficultyColor(problem.difficulty)}`}>
                                    <Target className="h-3.5 w-3.5" />
                                    {problem.difficulty}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditData((previous) => ({
                                        ...previous,
                                        status: previous.status === 'Todo' ? 'Completed' : 'Todo',
                                    }))}
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${getStatusColor(editData.status)} hover:scale-[1.01]`}
                                    title="Toggle status"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {editData.status}
                                </button>
                                {userProblem.date_solved && (
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                                        <CalendarDays className="h-3.5 w-3.5 text-amber-300" />
                                        Solved {new Date(userProblem.date_solved).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <h1 className="mt-5 text-3xl font-black leading-tight text-slate-50 sm:text-4xl lg:text-5xl">
                                {problem.title}
                            </h1>

                            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                                Review the original problem statement, keep your implementation close by, and shape your notes into a clean reusable solution summary.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {topicTags.length > 0 ? (
                                    topicTags.map((tag: any) => (
                                        <span
                                            key={tag.slug}
                                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300"
                                        >
                                            <Tag className="h-3.5 w-3.5 text-amber-300" />
                                            {tag.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400">
                                        No topic tags available
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch lg:w-72">
                            {problem.problemUrl && (
                                <a
                                    href={problem.problemUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-100"
                                    title={`Open in ${sourceName}`}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Open source problem
                                </a>
                            )}

                            <button
                                type="button"
                                onClick={handleUpdate}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-900/20 transition-all hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FileText className="h-4 w-4" />
                                {saving ? 'Saving...' : 'Save Notes'}
                            </button>
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.02fr_1.08fr]">
                    <article className="rounded-[2rem] border border-white/15 bg-slate-900/55 p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                                    <Code2 className="h-3.5 w-3.5 text-amber-300" />
                                    Problem Statement
                                </div>
                                <h2 className="mt-3 text-xl font-bold text-slate-50">Description and constraints</h2>
                            </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:p-5 h-[820px] overflow-y-auto">
                            {problem.content ? (
                                <div
                                    className="problem-content prose prose-sm max-w-none
                                        prose-headings:text-slate-100 prose-headings:font-semibold
                                        prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4
                                        prose-strong:text-slate-100 prose-strong:font-semibold
                                        prose-em:text-slate-300 prose-em:italic
                                        prose-code:text-amber-200 prose-code:bg-slate-950/70 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                        prose-pre:bg-slate-950/70 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl prose-pre:p-4 prose-pre:overflow-x-auto
                                        prose-pre:text-slate-200 prose-pre:text-sm prose-pre:leading-relaxed prose-pre:whitespace-pre-wrap
                                        prose-blockquote:border-l-4 prose-blockquote:border-amber-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-300
                                        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ul:text-slate-300
                                        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4 prose-ol:text-slate-300
                                        prose-li:mb-1 prose-li:leading-relaxed
                                        prose-table:border-collapse prose-table:w-full prose-table:mb-4
                                        prose-th:border prose-th:border-white/10 prose-th:bg-white/5 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-slate-100
                                        prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2 prose-td:text-slate-300 prose-a:text-amber-200 prose-a:mr-1"
                                    dangerouslySetInnerHTML={{ __html: marked(problem.content) }}
                                />
                            ) : (
                                <div className="flex min-h-[420px] items-center justify-center text-slate-400">
                                    <div className="text-center">
                                        <FileText className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                                        <p className="text-sm">Problem description not available.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>

                    <ProblemEditorWorkspace
                        implementationCode={implementationCode}
                        onImplementationCodeChange={setImplementationCode}
                        notes={editData.notes}
                        onNotesChange={(notes) => setEditData((previous) => ({ ...previous, notes }))}
                        onGenerateSummary={handleGenerateSummary}
                        isGenerating={aiLoading}
                        mode="stacked"
                        defaultTab="preview"
                    />
                </section>
            </main>
        </div>
    )
}

export default ProblemDetail
