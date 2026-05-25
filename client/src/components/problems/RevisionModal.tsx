import React from 'react'
import { X, Flame, Plus, BookOpen } from 'lucide-react'
import type { UserProblem } from '../../services/dsaApi'

export interface RevisionModalProps {
    isOpen: boolean
    problem: UserProblem | null
    newRevisionNote: string
    onNoteChange: (note: string) => void
    onAddRevision: () => void
    onClose: () => void
    isLoading?: boolean
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
    isOpen,
    problem,
    newRevisionNote,
    onNoteChange,
    onAddRevision,
    onClose,
    isLoading = false
}) => {
    if (!isOpen || !problem) return null

    return (
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
                            {(problem.problemId as any).title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-white/5 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto h-[40vh] px-6 py-6">
                    {problem.revision_history.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="text-slate-500 mb-4">
                                <BookOpen className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-200 mb-2">No revisions yet</h3>
                            <p className="text-slate-400">Start tracking your revision notes for this problem.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {problem.revision_history
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
                            onChange={(e) => onNoteChange(e.target.value)}
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
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onAddRevision}
                                    disabled={!newRevisionNote.trim() || isLoading}
                                    className="px-4 py-2 text-sm bg-amber-300/20 text-amber-200 border border-amber-300/40 rounded-lg hover:bg-amber-300/30 hover:border-amber-300/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center font-medium"
                                >
                                    {isLoading ? (
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
    )
}
