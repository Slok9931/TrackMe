import React from 'react'
import { Compass, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface EmptyStateProps {
    title: string
    description: string
    hasFilters?: boolean
    showAddButton?: boolean
    addButtonText?: string
    addButtonLink?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    hasFilters: _hasFilters = false,
    showAddButton = false,
    addButtonText = 'Add Your First Problem',
    addButtonLink = '/dsa/add'
}) => {
    return (
        <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-12 text-center shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="mb-6 text-slate-400">
                <Compass className="mx-auto h-20 w-20" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-100">{title}</h3>
            <p className="mx-auto mb-8 max-w-md text-slate-400">{description}</p>
            {showAddButton && (
                <Link
                    to={addButtonLink}
                    className="inline-flex items-center rounded-xl border border-amber-300/40 bg-amber-300/20 px-6 py-3 font-medium text-amber-200 transition-all hover:border-amber-300/60 hover:bg-amber-300/30"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    {addButtonText}
                </Link>
            )}
        </div>
    )
}