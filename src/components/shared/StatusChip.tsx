import * as React from 'react'
import { cn } from '../../utils'
import { useI18n } from '../../contexts/I18nContext'

export type StatusType =
    | 'success'
    | 'in_progress'
    | 'pending_review'
    | 'warning'
    | 'failure'
    | 'neutral'

export interface StatusChipProps extends React.HTMLAttributes<HTMLDivElement> {
    status?: string | null
    label?: string
}

// Map from the SRS 6.6
const statusMap: Record<string, StatusType> = {
    active: 'success',
    approved: 'success',
    completed: 'success',
    paid: 'success',
    delivered: 'success',
    enabled: 'success',

    processing: 'in_progress',
    scheduled: 'in_progress',
    confirmed: 'in_progress',
    applied: 'in_progress',

    pending: 'pending_review',
    pending_payment: 'pending_review',

    rescheduled: 'warning',
    expired: 'warning',
    shipped: 'warning',
    refunded: 'warning',

    cancelled: 'failure',
    rejected: 'failure',
    failed: 'failure',
    missed: 'failure',
    inactive: 'failure',
}

const statusStyles: Record<StatusType, string> = {
    success:
        'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
    in_progress:
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900',
    pending_review:
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
    warning:
        'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900',
    failure:
        'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900',
    neutral:
        'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
}

export function StatusChip({ status, label, className, ...props }: StatusChipProps) {
    const { t } = useI18n()
    const rawStatus = typeof status === 'string' && status.trim().length > 0 ? status.trim() : ''
    const normalizedStatus = rawStatus.toLowerCase()
    const type = statusMap[normalizedStatus] || 'neutral'
    const styles = statusStyles[type]

    const displayBase =
        typeof label === 'string' && label.trim().length > 0
            ? label.trim()
            : rawStatus || t('Unknown')

    // Capitalize and format text (e.g. pending_payment -> Pending Payment)
    const displayText = displayBase
        .replace(/-/g, '_')
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm',
                styles,
                className,
            )}
            {...props}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {t(displayText)}
        </div>
    )
}
