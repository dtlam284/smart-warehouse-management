import React from 'react'
import { cn } from '../../utils'

/**
 * Consistent section panel / card used across all admin screens.
 * Wraps content in a white rounded card with optional title.
 */
export interface SectionCardProps {
    title?: string
    description?: string
    children: React.ReactNode
    className?: string
    actions?: React.ReactNode
}

export function SectionCard({
    title,
    description,
    children,
    className,
    actions,
}: SectionCardProps) {
    return (
        <div
            className={cn(
                'rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950',
                className,
            )}
        >
            {(title || actions) && (
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        {title && (
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            {children}
        </div>
    )
}
