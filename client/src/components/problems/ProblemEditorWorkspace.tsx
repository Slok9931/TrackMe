import React, { useRef, useState } from 'react'
import { marked } from 'marked'
import {
    Bold,
    Code2,
    Eye,
    FileText,
    Heading2,
    Italic,
    Link2,
    List,
    Sparkles,
    Wand2,
} from 'lucide-react'

const workspaceContentStyles = `
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
    display: block !important;
    color: #fbbf24 !important;
    font-weight: 600 !important;
    margin: 0.15rem 0 0.05rem !important;
}

.problem-content pre strong:first-child {
    margin-top: 0 !important;
}

.problem-content pre strong + br {
    display: none !important;
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
    font-weight: 400 !important;
    font-family: inherit !important;
}

.problem-content code:not(pre code)::before,
.problem-content code:not(pre code)::after {
    content: '' !important;
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
    color: #fbbf24 !important;
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
    white-space: pre-wrap !important;
    display: block !important;
}

.problem-content div[style*="background"] strong,
.problem-content div[style*="background"] b {
    display: block !important;
    color: #fbbf24 !important;
    font-weight: 700 !important;
    margin: 0.35rem 0 0.1rem !important;
}

.problem-content div[style*="background"] strong:first-child,
.problem-content div[style*="background"] b:first-child {
    margin-top: 0 !important;
}

.problem-content div[style*="background"] p,
.problem-content div[style*="background"] div,
.problem-content div[style*="background"] ul,
.problem-content div[style*="background"] ol,
.problem-content div[style*="background"] pre,
.problem-content div[style*="background"] table {
    margin: 0 !important;
}

.problem-content div[style*="background"] br {
    display: block !important;
    content: '' !important;
    margin-bottom: 0.35rem !important;
}
`

type TabKey = 'code' | 'notes' | 'preview'

type WorkspaceMode = 'split' | 'stacked'

type MarkdownAction = {
    label: string
    snippet: string
    icon: React.ComponentType<{ className?: string }>
}

const markdownActions: MarkdownAction[] = [
    { label: 'Bold', snippet: '**Bold**', icon: Bold },
    { label: 'Italic', snippet: '*Italic*', icon: Italic },
    { label: 'Code', snippet: '`code`', icon: Code2 },
    { label: 'List', snippet: '\n- List item\n', icon: List },
    { label: 'Heading', snippet: '\n## Heading\n', icon: Heading2 },
    { label: 'Link', snippet: '[Link text](https://example.com)', icon: Link2 },
]

export interface ProblemEditorWorkspaceProps {
    implementationCode: string
    onImplementationCodeChange: (value: string) => void
    notes: string
    onNotesChange: (value: string) => void
    onGenerateSummary: () => Promise<boolean> | boolean
    isGenerating?: boolean
    mode?: WorkspaceMode
    defaultTab?: TabKey
    header?: React.ReactNode
    implementationLabel?: string
    implementationPlaceholder?: string
    notesLabel?: string
    notesPlaceholder?: string
    previewTitle?: string
    previewDescription?: string
    previewEmptyTitle?: string
    previewEmptyDescription?: string
    className?: string
}

const ProblemEditorWorkspace: React.FC<ProblemEditorWorkspaceProps> = ({
    implementationCode,
    onImplementationCodeChange,
    notes,
    onNotesChange,
    onGenerateSummary,
    isGenerating = false,
    mode = 'split',
    defaultTab = 'code',
    header,
    implementationLabel = 'Implementation',
    implementationPlaceholder = 'Paste the implementation you actually submitted or iterated on.',
    notesLabel = 'Notes',
    notesPlaceholder = '## Approach\n- Describe your strategy\n- Time: O(n), Space: O(1)\n\n## Key Insights\n- Important observations\n- Edge cases to remember',
    previewTitle = 'Live Preview',
    previewDescription = 'See how your markdown will render as you refine the solution.',
    previewEmptyTitle = 'Your preview will appear here',
    previewEmptyDescription = 'Start writing notes or generate an AI summary from the implementation box.',
    className = '',
}) => {
    const [activeTab, setActiveTab] = useState<TabKey>(defaultTab)
    const notesTextareaRef = useRef<HTMLTextAreaElement>(null)
    const panelHeightClass = 'h-[760px]'
    const scrollBodyClass = 'min-h-0 flex-1 overflow-y-auto'

    const insertSnippet = (snippet: string) => {
        const textarea = notesTextareaRef.current

        if (!textarea) {
            onNotesChange(`${notes}${snippet}`)
            return
        }

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const nextValue = `${notes.slice(0, start)}${snippet}${notes.slice(end)}`

        onNotesChange(nextValue)

        window.setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + snippet.length, start + snippet.length)
        }, 0)
    }

    const handleGenerateSummary = async () => {
        try {
            const result = await onGenerateSummary()

            if (result !== false) {
                setActiveTab('notes')
            }
        } catch {
            // Parent-level handlers usually surface the failure state.
        }
    }

    const previewHtml = notes.trim() ? marked(notes) : ''

    const renderPreviewPanel = () => (
        <div className={`flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-slate-950/50 p-4 shadow-inner shadow-black/10`}>
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-amber-300" />
                        {previewTitle}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                        {previewDescription}
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                    <FileText className="h-3.5 w-3.5 text-amber-300" />
                    Markdown supported
                </div>
            </div>

            <div className={`pr-1 ${scrollBodyClass}`}>
                {notes.trim() ? (
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
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                ) : (
                    <div className="flex min-h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center text-slate-400">
                        <div className="max-w-sm">
                            <FileText className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                            <h4 className="text-lg font-semibold text-slate-200">{previewEmptyTitle}</h4>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                {previewEmptyDescription}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    const renderEditorTabs = () => (
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-1 w-fit">
            <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'code' ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-900/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
                Implementation
            </button>
            <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'notes' ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-900/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
                Notes
            </button>
            <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'preview' ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-900/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
                Preview
            </button>
        </div>
    )

    return (
        <section className={`rounded-[2rem] border border-white/15 bg-slate-900/55 p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl ${className}`}>
            <style dangerouslySetInnerHTML={{ __html: workspaceContentStyles }} />

            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
                        <Sparkles className="h-3.5 w-3.5" />
                        Solution Workspace
                    </div>
                    <h2 className="mt-3 text-2xl font-bold text-slate-50">Notes, code, and live preview</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Keep your implementation, markdown notes, and AI summary in one place while you refine your solution.
                    </p>
                </div>

                {header ? <div className="flex flex-wrap items-center gap-2">{header}</div> : null}
            </div>

            {mode === 'split' ? (
                <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-[0.98fr_1.02fr]">
                    <div className={`flex h-full min-h-0 flex-col space-y-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 shadow-inner shadow-black/10 ${panelHeightClass}`}>
                        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-1 w-fit">
                            <button
                                type="button"
                                onClick={() => setActiveTab('code')}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'code' ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-900/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                            >
                                Implementation
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('notes')}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'notes' ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-900/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                            >
                                Notes
                            </button>
                        </div>

                        {activeTab === 'code' ? (
                            <div className={`flex h-full min-h-0 flex-col ${scrollBodyClass}`}>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                                    <Code2 className="h-4 w-4 text-amber-300" />
                                    {implementationLabel}
                                </label>
                                <textarea
                                    value={implementationCode}
                                    onChange={(e) => onImplementationCodeChange(e.target.value)}
                                    placeholder={implementationPlaceholder}
                                    rows={10}
                                    className="w-full h-full min-h-[260px] resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 font-mono text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20"
                                />
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs leading-5 text-slate-500">
                                        The AI summary uses this block together with your notes to generate a cleaner recap.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => void handleGenerateSummary()}
                                        disabled={isGenerating || !implementationCode.trim()}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-900/20 transition-all hover:bg-amber-200 hover:shadow-amber-900/30 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[160px]"
                                    >
                                        <Wand2 className="h-4 w-4" />
                                        {isGenerating ? 'Generating...' : 'Generate Summary'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={`flex h-full min-h-0 flex-col ${scrollBodyClass}`}>
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    {markdownActions.map(({ label, snippet, icon: Icon }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => insertSnippet(snippet)}
                                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                                            title={label}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                                    <FileText className="h-4 w-4 text-amber-300" />
                                    {notesLabel}
                                </label>
                                <textarea
                                    ref={notesTextareaRef}
                                    value={notes}
                                    onChange={(e) => onNotesChange(e.target.value)}
                                    placeholder={notesPlaceholder}
                                    rows={16}
                                    className="w-full h-full min-h-[320px] resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 font-mono text-sm leading-relaxed text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20"
                                />
                            </div>
                        )}
                    </div>

                    {renderPreviewPanel()}
                </div>
            ) : (
                <div className={`mt-6 flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-slate-950/50 p-4 shadow-inner shadow-black/10 ${panelHeightClass}`}>
                    <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
                        {renderEditorTabs()}
                    </div>

                    <div className={`mt-4 flex-1 min-h-0 ${scrollBodyClass}`}>
                        {activeTab === 'code' ? (
                            <div className="flex h-full min-h-0 flex-col">
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                                    <Code2 className="h-4 w-4 text-amber-300" />
                                    {implementationLabel}
                                </label>
                                <textarea
                                    value={implementationCode}
                                    onChange={(e) => onImplementationCodeChange(e.target.value)}
                                    placeholder={implementationPlaceholder}
                                    rows={10}
                                    className="w-full h-full min-h-[260px] resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 font-mono text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20"
                                />
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs leading-5 text-slate-500">
                                        The AI summary uses this block together with your notes to generate a cleaner recap.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => void handleGenerateSummary()}
                                        disabled={isGenerating || !implementationCode.trim()}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-900/20 transition-all hover:bg-amber-200 hover:shadow-amber-900/30 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[160px]"
                                    >
                                        <Wand2 className="h-4 w-4" />
                                        {isGenerating ? 'Generating...' : 'Generate Summary'}
                                    </button>
                                </div>
                            </div>
                        ) : activeTab === 'notes' ? (
                            <div className="flex h-full min-h-0 flex-col">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    {markdownActions.map(({ label, snippet, icon: Icon }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => insertSnippet(snippet)}
                                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                                            title={label}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                                    <FileText className="h-4 w-4 text-amber-300" />
                                    {notesLabel}
                                </label>
                                <textarea
                                    ref={notesTextareaRef}
                                    value={notes}
                                    onChange={(e) => onNotesChange(e.target.value)}
                                    placeholder={notesPlaceholder}
                                    rows={16}
                                    className="w-full h-full min-h-[320px] resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 font-mono text-sm leading-relaxed text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20"
                                />
                            </div>
                        ) : (
                            renderPreviewPanel()
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}

export default ProblemEditorWorkspace