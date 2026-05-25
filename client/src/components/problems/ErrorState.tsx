import React from 'react'
import { AlertTriangle } from 'lucide-react'

export interface ErrorStateProps {
    message: string
    onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    message,
    onRetry
}) => {
    return (
        <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-8 text-center shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="text-red-400 mb-4">
                <AlertTriangle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Error Loading Problems</h3>
            <p className="text-slate-400 mb-6">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2.5 bg-amber-300/20 text-amber-200 border border-amber-300/40 rounded-xl hover:bg-amber-300/30 hover:border-amber-300/60 transition-all font-medium text-sm"
                >
                    Try Again
                </button>
            )}
        </div>
    )
}
