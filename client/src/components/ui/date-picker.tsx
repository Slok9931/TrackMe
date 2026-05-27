import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, parseLocalDateKey, toLocalDateKey } from '../../lib/utils.ts'

export interface DatePickerProps {
    value: string
    onChange: (value: string) => void
    placeholder: string
    wrapperClassName?: string
    buttonClassName?: string
    popoverClassName?: string
    overlayClassName?: string
    iconClassName?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder,
    wrapperClassName,
    buttonClassName,
    popoverClassName,
    overlayClassName,
    iconClassName,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(value ? parseLocalDateKey(value) : null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({})

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days: Array<Date | null> = []

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isSameDay = (date1: Date | null, date2: Date | null) => {
        if (!date1 || !date2) return false
        return date1.toDateString() === date2.toDateString()
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        onChange(toLocalDateKey(date))
        setIsOpen(false)
    }

    const clearDate = () => {
        setSelectedDate(null)
        onChange('')
        setIsOpen(false)
    }

    const updatePopoverPosition = () => {
        const wrapper = wrapperRef.current

        if (!wrapper) return

        const rect = wrapper.getBoundingClientRect()
        const popoverWidth = Math.min(320, window.innerWidth - 16)
        const left = Math.max(8, Math.min(rect.right - popoverWidth, window.innerWidth - popoverWidth - 8))
        const top = rect.bottom + 8

        setPopoverStyle({
            position: 'fixed',
            top,
            left,
            width: popoverWidth,
        })
    }

    useEffect(() => {
        if (value && value !== (selectedDate ? toLocalDateKey(selectedDate) : undefined)) {
            setSelectedDate(parseLocalDateKey(value))
        } else if (!value) {
            setSelectedDate(null)
        }
    }, [selectedDate, value])

    useEffect(() => {
        if (!isOpen) return

        updatePopoverPosition()

        const handleWindowChange = () => updatePopoverPosition()
        window.addEventListener('resize', handleWindowChange)
        window.addEventListener('scroll', handleWindowChange, true)

        return () => {
            window.removeEventListener('resize', handleWindowChange)
            window.removeEventListener('scroll', handleWindowChange, true)
        }
    }, [isOpen])

    return (
        <div ref={wrapperRef} className={cn('relative z-50', wrapperClassName)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex w-full items-center justify-between rounded-xl border border-white/15 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 shadow-[0_10px_30px_rgba(2,6,23,0.25)] transition-all hover:border-amber-300/40 hover:bg-slate-900/90 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/40',
                    buttonClassName,
                )}
            >
                <span className="flex items-center">
                    <CalendarDays className={cn('mr-2 h-4 w-4 text-slate-300', iconClassName)} />
                    <span className={selectedDate ? 'text-slate-100' : 'text-slate-400'}>
                        {selectedDate ? formatDate(selectedDate) : placeholder}
                    </span>
                </span>
                <ChevronDown className={cn(`h-4 w-4 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`)} />
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <>
                    <div className={cn('fixed inset-0 z-[9998]', overlayClassName)} onClick={() => setIsOpen(false)} />
                    <div className={cn('z-[9999] rounded-xl border border-white/15 bg-slate-900 p-4 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl', popoverClassName)} style={popoverStyle}>
                        <div className="mb-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <h3 className="text-sm font-semibold text-white">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mb-2 grid grid-cols-7 gap-1">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                <div key={day} className="py-1 text-center text-xs font-medium text-slate-400">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth(currentMonth).map((date, index) => (
                                <div key={index} className="aspect-square">
                                    {date && (
                                        <button
                                            type="button"
                                            onClick={() => handleDateSelect(date)}
                                            className={`h-full w-full rounded-lg text-xs transition-colors hover:bg-white/10 ${isSameDay(date, selectedDate)
                                                ? 'bg-amber-300 text-slate-950 hover:bg-amber-200'
                                                : isToday(date)
                                                    ? 'bg-amber-300/20 text-amber-100'
                                                    : 'text-slate-200'
                                                }`}
                                        >
                                            {date.getDate()}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex justify-between border-t border-white/10 pt-3">
                            <button
                                type="button"
                                onClick={clearDate}
                                className="rounded-lg px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date()
                                    handleDateSelect(today)
                                }}
                                className="rounded-lg px-3 py-1 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-300/10 hover:text-amber-100"
                            >
                                Today
                            </button>
                        </div>
                    </div>
                </>,
                document.body,
            )}
        </div>
    )
}
