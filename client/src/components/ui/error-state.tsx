import React from 'react'
import { AlertTriangle } from 'lucide-react'

export interface ErrorStateProps {
    title?: string
    message: string
    onRetry?: () => void
    retryLabel?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Error Loading Problems',
    message,
    onRetry,
    retryLabel = 'Try Again',
}) => {
    return (
        <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-8 text-center shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="mb-4 text-red-400">
                <AlertTriangle className="mx-auto h-16 w-16" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-100">{title}</h3>
            <p className="mb-6 text-slate-400">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="rounded-xl border border-amber-300/40 bg-amber-300/20 px-6 py-2.5 text-sm font-medium text-amber-200 transition-all hover:border-amber-300/60 hover:bg-amber-300/30"
                >
                    {retryLabel}
                </button>
            )}
        </div>
    )
}