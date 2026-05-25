import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import {
    Bold,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Code2,
    Heading2,
    Italic,
    List,
    Wand2,
} from 'lucide-react'
import DSAApiService from '../services/dsaApi'
import { DatePicker } from './ui/date-picker'

const AddProblem: React.FC = () => {
    // Basic template for notes
    const notesTemplate = ``

    const [formData, setFormData] = useState({
        titleSlug: '',
        platform: 'leetcode' as 'leetcode' | 'gfg',
        status: 'Todo' as 'Todo' | 'Completed',
        notes: notesTemplate,
        date_solved: ''
    })
    const [implementationCode, setImplementationCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [leftTab, setLeftTab] = useState<'code' | 'notes'>('code')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const navigate = useNavigate()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const extractTitleSlugFromUrl = (url: string): { titleSlug: string; platform: 'leetcode' | 'gfg' } | null => {
        try {
            // LeetCode URL pattern
            const leetcodeRegex = /https:\/\/leetcode\.com\/problems\/([a-z0-9-]+)\/?/
            const leetcodeMatch = url.match(leetcodeRegex)
            if (leetcodeMatch) {
                return { titleSlug: leetcodeMatch[1], platform: 'leetcode' }
            }

            // GFG URL pattern
            const gfgRegex = /https:\/\/www\.geeksforgeeks\.org\/problems\/([a-z0-9-]+)(?:\/\d+)?/
            const gfgMatch = url.match(gfgRegex)
            if (gfgMatch) {
                return { titleSlug: gfgMatch[1], platform: 'gfg' }
            }

            return null
        } catch {
            return null
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        if (name === 'titleSlug') {
            // If it looks like a URL, extract the titleSlug and platform
            const extracted = extractTitleSlugFromUrl(value)
            if (extracted) {
                setFormData(prev => ({
                    ...prev,
                    titleSlug: extracted.titleSlug,
                    platform: extracted.platform
                }))
            } else {
                setFormData(prev => ({ ...prev, titleSlug: value }))
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const insertText = (text: string) => {
        if (!textareaRef.current) return

        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const currentValue = formData.notes
        const nextValue = currentValue.slice(0, start) + text + currentValue.slice(end)

        setFormData(prev => ({ ...prev, notes: nextValue }))

        window.setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + text.length, start + text.length)
        }, 0)
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
                platform: formData.platform,
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
                platform: 'leetcode',
                status: 'Todo',
                notes: notesTemplate,
                date_solved: ''
            })
            setImplementationCode('')

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
        <div className="relative min-h-screen overflow-x-hidden bg-[#07111f] text-slate-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

            <main className="relative mx-auto min-h-screen px-4 py-6 sm:px-8 lg:px-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <section className="relative z-20 grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 items-center">
                        <div className="relative order-2 xl:order-1">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 mb-4">
                                <span className="h-2 w-2 rounded-full bg-amber-300" />
                                Add Problem Workspace
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-2">
                                Add New Problem
                            </h1>
                            <p className="text-base sm:text-lg text-slate-200/90 mb-5">
                                Add a problem from LeetCode or GeeksforGeeks, capture its status, and keep your notes and implementation together.
                            </p>

                            {success && (
                                <div className="mb-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                                    <div className="flex items-center">
                                        <svg className="mr-3 h-5 w-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="font-medium text-emerald-50">
                                            Problem added successfully! Redirecting to problems list...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-4">
                                    <div className="flex items-center">
                                        <svg className="mr-3 h-5 w-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <p className="text-red-100">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-[2rem] border border-white/15 bg-slate-900/55 p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                                <div className="flex flex-col gap-2">
                                    <div className="md:col-span-2">
                                        <label htmlFor="titleSlug" className="block text-sm font-medium text-slate-300 mb-2">
                                            Problem URL <span className="text-amber-300">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="titleSlug"
                                            name="titleSlug"
                                            value={formData.titleSlug}
                                            onChange={handleInputChange}
                                            placeholder={
                                                formData.platform === 'leetcode'
                                                    ? 'e.g., https://leetcode.com/problems/set-matrix-zeroes/'
                                                    : 'e.g., count-subarray-with-given-xor or https://www.geeksforgeeks.org/problems/count-subarray-with-given-xor/1'
                                            }
                                            className="w-full rounded-xl border border-white/15 bg-slate-900/75 px-4 py-3 text-slate-100 placeholder:text-slate-500 shadow-[0_10px_30px_rgba(2,6,23,0.25)] transition-all hover:border-amber-300/40 hover:bg-slate-900/90 focus:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                                            required
                                        />
                                        <p className="mt-2 text-sm text-slate-400">
                                            You can paste the full URL from LeetCode or GeeksforGeeks.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                        <label className="block text-sm font-medium text-slate-300 text-center md:text-left">
                                            Status <span className="text-amber-300">*</span>
                                        </label>
                                        <div className="flex h-full items-center justify-start gap-4 shadow-[0_10px_30px_rgba(2,6,23,0.25)]">
                                            <button
                                                type="button"
                                                onClick={() => setFormData((prev) => ({
                                                    ...prev,
                                                    status: prev.status === 'Todo' ? 'Completed' : 'Todo',
                                                    date_solved: prev.status === 'Todo' ? prev.date_solved : ''
                                                }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300/40 ${formData.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                                role="switch"
                                                aria-checked={formData.status === 'Completed'}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.status === 'Completed' ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                            {formData.status === 'Completed' ? (
                                                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-200">
                                                    <ClipboardList className="h-4 w-4" />
                                                    Todo
                                                </span>
                                            )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                                                    <CalendarDays className="h-4 w-4 text-amber-300" />
                                                    Date Solved {formData.status === 'Completed' && <span className="text-amber-300">*</span>}
                                                </label>
                                                <DatePicker
                                                    value={formData.date_solved}
                                                    onChange={(value) => setFormData((prev) => ({ ...prev, date_solved: value }))}
                                                    placeholder="Select date solved"
                                                    wrapperClassName="w-full"
                                                />
                                                <p className="mt-2 text-sm text-slate-400">
                                                    {formData.status === 'Completed' ? 'When you solved it' : 'Available when completed'}
                                                </p>
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 xl:order-2">
                            <div className="relative overflow-hidden">
                                <img
                                    src="/4.png"
                                    alt="Add problem illustration"
                                    className="w-full max-h-[560px] object-contain"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
                        <div className="relative z-10 overflow-hidden rounded-3xl border border-white/15 bg-slate-900/55 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                            <div className="flex flex-col gap-3 border-b border-white/10 p-5">

                                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-1 w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setLeftTab('code')}
                                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${leftTab === 'code' ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-900/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        Implementation
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLeftTab('notes')}
                                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${leftTab === 'notes' ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-900/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        Notes
                                    </button>
                                </div>
                            </div>

                            <div className="p-5">
                                {leftTab === 'code' ? (
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 shadow-inner">
                                        <textarea
                                            placeholder="Paste full implementation code here (preserves indentation)..."
                                            value={implementationCode}
                                            onChange={(e) => setImplementationCode(e.target.value)}
                                            rows={12}
                                            className="w-full min-h-[280px] resize-y rounded-xl border border-white/10 bg-slate-950/60 px-4 py-4 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20"
                                        />

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-xs leading-5 text-slate-400">
                                                Paste clean, runnable code here. The AI summary uses this block to generate your notes.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!implementationCode.trim()) {
                                                        setError('Please paste implementation code first')
                                                        return
                                                    }
                                                    setAiLoading(true)
                                                    setError(null)
                                                    try {
                                                        const result = await DSAApiService.generateAiSummary(implementationCode, formData.notes)
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            notes: result.summary,
                                                        }))
                                                        setLeftTab('notes')
                                                    } catch (err: any) {
                                                        const errorMsg = err.response?.data?.details || err.message || 'Failed to generate summary'
                                                        setError(`AI Summary Error: ${errorMsg}`)
                                                    } finally {
                                                        setAiLoading(false)
                                                    }
                                                }}
                                                disabled={aiLoading || !implementationCode.trim()}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-900/20 transition-all hover:bg-amber-200 hover:shadow-amber-900/30 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[160px]"
                                            >
                                                <Wand2 className="h-4 w-4" />
                                                {aiLoading ? 'Generating...' : 'Generate Summary'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 shadow-inner">
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <button type="button" onClick={() => insertText('**Bold**')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white" title="Bold">
                                                <Bold className="h-3.5 w-3.5" />
                                                Bold
                                            </button>
                                            <button type="button" onClick={() => insertText('*Italic*')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white" title="Italic">
                                                <Italic className="h-3.5 w-3.5" />
                                                Italic
                                            </button>
                                            <button type="button" onClick={() => insertText('`code`')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white" title="Inline Code">
                                                <Code2 className="h-3.5 w-3.5" />
                                                Code
                                            </button>
                                            <button type="button" onClick={() => insertText('\n- List item\n')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white" title="List">
                                                <List className="h-3.5 w-3.5" />
                                                List
                                            </button>
                                            <button type="button" onClick={() => insertText('\n## Heading\n')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white" title="Heading">
                                                <Heading2 className="h-3.5 w-3.5" />
                                                Heading
                                            </button>
                                        </div>
                                        <textarea
                                            ref={textareaRef}
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows={14}
                                            className="notes-editor w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-4 py-4 font-mono text-sm leading-relaxed text-slate-100 outline-none focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20"
                                            placeholder={notesTemplate}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-white/15 bg-slate-900/55 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                            <div className="border-b border-white/10 p-5">
                                <h3 className="text-lg font-semibold text-slate-100 mb-1">Live Preview</h3>
                                <p className="text-sm text-slate-400">
                                    See how your markdown will be rendered.
                                </p>
                            </div>

                            <div className="h-[460px] overflow-y-auto p-5">
                                {formData.notes.trim() ? (
                                    <div
                                        className="problem-content prose prose-sm max-w-none
                                            prose-headings:text-slate-100 prose-headings:font-semibold
                                            prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4
                                            prose-strong:text-slate-100 prose-strong:font-semibold
                                            prose-em:text-slate-300 prose-em:italic
                                            prose-code:text-amber-200 prose-code:bg-slate-950/70 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                            prose-pre:bg-slate-950/70 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                                            prose-pre:text-slate-200 prose-pre:text-sm prose-pre:leading-relaxed prose-pre:whitespace-pre-wrap
                                            prose-blockquote:border-l-4 prose-blockquote:border-amber-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-300
                                            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ul:text-slate-300
                                            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4 prose-ol:text-slate-300
                                            prose-li:mb-1 prose-li:leading-relaxed
                                            prose-table:border-collapse prose-table:w-full prose-table:mb-4
                                            prose-th:border prose-th:border-white/10 prose-th:bg-white/5 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-slate-100
                                            prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2 prose-td:text-slate-300 prose-a:text-amber-200 prose-a:mr-1"
                                        dangerouslySetInnerHTML={{ __html: marked(formData.notes) }}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-400">
                                        <div className="text-center">
                                            <svg className="mx-auto mb-4 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm">Start writing to see the preview</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/15 bg-slate-900/55 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        <Link
                            to="/dsa/problems"
                            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 font-semibold text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-xl bg-amber-300 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-900/20 transition-all hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
            </main>
        </div>
    )
}

export default AddProblem
