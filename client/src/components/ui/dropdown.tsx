import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface DropdownOption {
    value: string
    label: string
    icon?: string
}

export interface DropdownProps {
    value: string
    options: DropdownOption[]
    onChange: (value: string) => void
    placeholder: string
    className?: string
}

export const Dropdown: React.FC<DropdownProps> = ({
    value,
    options,
    onChange,
    placeholder,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find(opt => opt.value === value)

    return (
        <div className={`relative z-50 ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 shadow-[0_10px_30px_rgba(2,6,23,0.25)] transition-all hover:border-amber-300/40 hover:bg-slate-900/90 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/40"
            >
                <span className="flex items-center">
                    {selectedOption?.icon && <span className="mr-2">{selectedOption.icon}</span>}
                    <span className={selectedOption ? 'text-slate-100' : 'text-slate-400'}>
                        {selectedOption?.label || placeholder}
                    </span>
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/15 bg-slate-900 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                                className={`flex w-full items-center px-4 py-3 text-left text-sm transition-colors hover:bg-white/5 ${value === option.value ? 'bg-amber-300/10 text-amber-100' : 'text-slate-200'
                                    }`}
                            >
                                {option.icon && <span className="mr-2">{option.icon}</span>}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
