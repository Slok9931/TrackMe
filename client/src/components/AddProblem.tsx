import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
} from 'lucide-react'
import DSAApiService from '../services/dsaApi'
import { DatePicker } from './ui/date-picker'
import ProblemEditorWorkspace from './problems/ProblemEditorWorkspace'

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
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const navigate = useNavigate()

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
            if (error.response?.data?.error) {
                setError(error.response.data.error)
            } else {
                setError('Failed to add problem. Please check if the problem exists on LeetCode.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateSummary = async () => {
        if (!implementationCode.trim()) {
            setError('Please paste implementation code first')
            return false
        }

        setAiLoading(true)
        setError(null)

        try {
            const result = await DSAApiService.generateAiSummary(implementationCode, formData.notes)
            setFormData((prev) => ({
                ...prev,
                notes: result.summary,
            }))
            return true
        } catch (err: any) {
            const errorMsg = err.response?.data?.details || err.message || 'Failed to generate summary'
            setError(`AI Summary Error: ${errorMsg}`)
            return false
        } finally {
            setAiLoading(false)
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
                                        <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-300" />
                                        <p className="font-medium text-emerald-50">
                                            Problem added successfully! Redirecting to problems list...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-4">
                                    <div className="flex items-center">
                                        <AlertTriangle className="mr-3 h-5 w-5 text-red-300" />
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

                    <ProblemEditorWorkspace
                        implementationCode={implementationCode}
                        onImplementationCodeChange={setImplementationCode}
                        notes={formData.notes}
                        onNotesChange={(notes) => setFormData((prev) => ({ ...prev, notes }))}
                        onGenerateSummary={handleGenerateSummary}
                        isGenerating={aiLoading}
                    />

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
