import * as React from 'react'
import { cn } from './utils'

//#region types
export type StatusChipStatus = 'complete' | 'partial' | 'pending'

export interface IStatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
    status: StatusChipStatus
    label?: string
}
//#endregion types

//#region constants
const statusClass: Record<StatusChipStatus, string> = {
    complete:
        'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300',
    partial:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    pending:
        'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
}

const defaultLabel: Record<StatusChipStatus, string> = {
    complete: 'Đủ',
    partial: 'Một phần',
    pending: 'Chưa quét',
}
//#endregion constants

//#region component
export function StatusChip({ status, label, className, ...props }: IStatusChipProps) {
    return (
        <span
            className={cn(
                'inline-flex min-w-[92px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                statusClass[status],
                className,
            )}
            {...props}
        >
            {label ?? defaultLabel[status]}
        </span>
    )
}
//#endregion component
