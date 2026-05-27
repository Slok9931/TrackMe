import React, { useMemo } from 'react'
import { CalendarDays, Flame } from 'lucide-react'
import { cn, toLocalDateKey } from '../../../lib/utils.ts'
import type { UserProblem } from '../../../services/dsaApi'

interface StreakCalendarCardProps {
    allUserProblems: UserProblem[]
    className?: string
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const formatMonthLabel = (date: Date) =>
    date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })

const StreakCalendarCard: React.FC<StreakCalendarCardProps> = ({ allUserProblems, className }) => {
    const currentMonth = new Date()
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const { cells, solvedDates } = useMemo(() => {
        const solvedDatesSet = new Set(
            allUserProblems
                .filter((problem) => problem.status === 'Completed' && problem.date_solved)
                .map((problem) => toLocalDateKey(new Date(problem.date_solved as string))),
        )

        const daysInMonth = monthEnd.getDate()
        const leadingEmptyCells = monthStart.getDay()
        const monthCells: Array<{ date: Date | null; key: string }> = []

        for (let index = 0; index < leadingEmptyCells; index += 1) {
            monthCells.push({ date: null, key: `empty-${index}` })
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            monthCells.push({ date, key: toLocalDateKey(date) })
        }

        const solvedCount = monthCells.reduce((count, cell) => {
            if (!cell.date) return count
            return solvedDatesSet.has(cell.key) ? count + 1 : count
        }, 0)

        return {
            cells: monthCells,
            solvedDaysInMonth: solvedCount,
            solvedDates: solvedDatesSet,
        }
    }, [allUserProblems, currentMonth.getMonth(), currentMonth.getFullYear(), monthEnd, monthStart])

    return (
        <div className={cn('flex h-full flex-col rounded-3xl border border-white/15 bg-slate-900/55 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl', className)}>
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-300">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Streak Calendar</h3>
                        <p className="text-sm text-slate-400">Solved days this month</p>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <p className="text-base font-semibold text-slate-100">{formatMonthLabel(currentMonth)}</p>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                    <Flame className="h-4 w-4 text-orange-400" />
                    Solved day
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
                {weekDays.map((day) => (
                    <div key={day} className="pb-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
                {cells.map((cell) => {
                    if (!cell.date) {
                        return <div key={cell.key} className="aspect-square rounded-xl" />
                    }

                    const isSolved = solvedDates.has(cell.key)
                    const isToday = cell.key === toLocalDateKey(new Date())

                    return (
                        <div
                            key={cell.key}
                            className={cn(
                                'flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200',
                                isSolved
                                    ? 'border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 to-amber-300/10 text-emerald-50 shadow-[0_10px_20px_rgba(16,185,129,0.15)]'
                                    : 'border-white/10 bg-slate-950/40 text-slate-300',
                                isToday && 'ring-2 ring-amber-300/60 ring-offset-0',
                            )}
                        >
                            {isSolved ? (
                                <>
                                    <Flame className="h-4 w-4 text-orange-300" />
                                    <span className="mt-1 text-[11px] leading-none text-slate-100">{cell.date.getDate()}</span>
                                </>
                            ) : (
                                <span className="text-base leading-none">{cell.date.getDate()}</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default StreakCalendarCard