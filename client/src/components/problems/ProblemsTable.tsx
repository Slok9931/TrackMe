import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, ExternalLink, Trash2, CheckCircle2, Circle, Flame, ChevronRight } from 'lucide-react'
import type { UserProblem } from '../../services/dsaApi'

export interface ProblemsTableProps {
    problems: UserProblem[]
    onStatusUpdate: (userProblemId: string, newStatus: 'Todo' | 'Completed') => void
    onRevisionClick: (problem: UserProblem) => void
    onDeleteClick: (problem: UserProblem) => void
}

export const ProblemsTable: React.FC<ProblemsTableProps> = ({
    problems,
    onStatusUpdate,
    onRevisionClick,
    onDeleteClick
}) => {
    return (
        <div className="relative z-10 rounded-3xl border border-white/15 bg-slate-900/55 overflow-hidden shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-white/10">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Problem
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Difficulty
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Date Solved
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Revisions
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {problems.map((userProblem) => {
                            const problem = userProblem.problemId as any
                            return (
                                <tr key={userProblem._id} className="hover:bg-white/5 transition-colors border-b border-white/10">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-semibold text-slate-100 mb-2 flex items-center">
                                                <span className="mr-2">
                                                    {problem.platform === 'gfg' ? <img src="/GFG.png" alt="GeeksforGeeks" className="w-6 h-6 rounded-full" /> : <img src="/Leetcode.png" alt="LeetCode" className="w-6 h-6 rounded-full" />}
                                                </span>
                                                <Link to={`/dsa/problems/${userProblem._id}`} className="hover:text-amber-300 transition-colors">
                                                    {problem.title}
                                                </Link>
                                            </div>
                                            {problem.topicTags && problem.topicTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {problem.topicTags.slice(0, 3).map((tag: any) => (
                                                        <span key={tag.slug} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg border border-white/10">
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                    {problem.topicTags.length > 3 && (
                                                        <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg border border-white/10">
                                                            +{problem.topicTags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg ${
                                            problem.difficulty === 'Easy'
                                                ? 'bg-emerald-300/15 text-emerald-200 border border-emerald-300/30'
                                                : problem.difficulty === 'Medium'
                                                ? 'bg-orange-300/15 text-orange-200 border border-orange-300/30'
                                                : 'bg-red-300/15 text-red-200 border border-red-300/30'
                                        }`}>
                                            {problem.difficulty === 'Easy' && '🟢'}
                                            {problem.difficulty === 'Medium' && '🟡'}
                                            {problem.difficulty === 'Hard' && '🔴'}
                                            <span className="ml-1.5">{problem.difficulty}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => onStatusUpdate(userProblem._id, userProblem.status === 'Todo' ? 'Completed' : 'Todo')}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300/60 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                                    userProblem.status === 'Completed'
                                                        ? 'bg-emerald-500/30 border border-emerald-300/40'
                                                        : 'bg-slate-600/30 border border-white/10'
                                                }`}
                                                role="switch"
                                                aria-checked={userProblem.status === 'Completed'}
                                                title={`Toggle to ${userProblem.status === 'Todo' ? 'Completed' : 'Todo'}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        userProblem.status === 'Completed' ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                            {userProblem.status === 'Completed' ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-slate-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        {userProblem.date_solved
                                            ? new Date(userProblem.date_solved).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })
                                            : '-'
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            onClick={() => onRevisionClick(userProblem)}
                                            className="flex items-center hover:text-amber-300 transition-colors cursor-pointer text-slate-400"
                                            title="View revision history"
                                        >
                                            <Flame className="w-4 h-4 text-slate-400 mr-2" />
                                            <span className="font-semibold">{userProblem.revision_history.length}</span>
                                            <ChevronRight className="w-3 h-3 ml-1 text-slate-500" />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/dsa/problems/${userProblem._id}`}
                                                className="p-2 text-slate-400 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-all"
                                                title="View Problem Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <a
                                                href={problem.problemUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-all"
                                                title="Open on Platform"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => onDeleteClick(userProblem)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                                                title="Delete Problem"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
