import React from 'react'

interface LoadingStateProps {
    message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] text-slate-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/60 px-8 py-6 shadow-[0_24px_70px_rgba(2,6,23,0.65)] backdrop-blur-xl">
                <div className="h-4 w-4 animate-pulse rounded-full bg-amber-300" />
                <div className="h-4 w-4 animate-pulse rounded-full bg-amber-300 [animation-delay:150ms]" />
                <div className="h-4 w-4 animate-pulse rounded-full bg-amber-300 [animation-delay:300ms]" />
                <span className="ml-2 text-sm font-medium tracking-wide text-slate-300">{message}</span>
            </div>
        </div>
    )
}