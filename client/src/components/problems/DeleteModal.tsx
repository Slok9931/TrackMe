import React from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import type { UserProblem } from '../../services/dsaApi'

export interface DeleteModalProps {
    isOpen: boolean
    problem: UserProblem | null
    onConfirm: () => void
    onClose: () => void
    isLoading?: boolean
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
    isOpen,
    problem,
    onConfirm,
    onClose,
    isLoading = false
}) => {
    if (!isOpen || !problem) return null

    return (
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
                        Are you sure you want to remove <span className="font-semibold text-slate-100">"{(problem.problemId as any).title}"</span> from your tracking list?
                    </p>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-red-300">
                                <p className="font-semibold mb-2">This will permanently delete:</p>
                                <ul className="space-y-1 text-red-200/90">
                                    <li>• Your progress tracking for this problem</li>
                                    <li>• All revision notes ({problem.revision_history.length} revisions)</li>
                                    <li>• Your solution notes and completion status</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="px-6 py-4 border-t border-white/10 bg-slate-800/30 flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm bg-red-500/20 text-red-200 border border-red-500/30 rounded-lg hover:bg-red-500/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center font-medium"
                    >
                        {isLoading ? (
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
    )
}
