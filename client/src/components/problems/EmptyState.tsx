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
    hasFilters = false,
    showAddButton = false,
    addButtonText = 'Add Your First Problem',
    addButtonLink = '/dsa/add'
}) => {
    return (
        <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-12 text-center shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="text-slate-400 mb-6">
                <Compass className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">{description}</p>
            {showAddButton && (
                <Link
                    to={addButtonLink}
                    className="inline-flex items-center px-6 py-3 bg-amber-300/20 text-amber-200 border border-amber-300/40 rounded-xl hover:bg-amber-300/30 hover:border-amber-300/60 transition-all font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {addButtonText}
                </Link>
            )}
        </div>
    )
}
