import React from 'react'

interface LoadingStateProps {
    message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-8 py-7 backdrop-blur-xl shadow-[0_24px_70px_rgba(2,6,23,0.65)]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse animation-delay-400"></div>
          </div>
          <p className="text-sm tracking-wide text-slate-300">{message}</p>
        </div>
      </div>
    )
}