import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50 flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
                    <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
                    <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900/70 p-8 text-center shadow-[0_24px_80px_rgba(2,6,23,0.7)] backdrop-blur-xl space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-red-300/20 bg-red-400/10 px-4 py-1 text-sm text-red-200">
                            <span className="h-2 w-2 rounded-full bg-red-300" />
                            Application error
                        </div>
                        <h2 className="text-3xl font-bold text-white">Something went wrong</h2>
                        <p className="text-slate-300 leading-7">
                            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: undefined })}
                            className="px-6 py-3 bg-amber-300 text-slate-950 rounded-xl font-semibold hover:bg-amber-200 transition-colors shadow-[0_12px_30px_rgba(251,191,36,0.25)]"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
