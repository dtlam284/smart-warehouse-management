import * as React from 'react'
import { cn } from './utils'

//#region types
export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface ISpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: SpinnerSize
    label?: string
}
//#endregion types

//#region constants
const spinnerSizeClass: Record<SpinnerSize, string> = {
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-7 w-7 border-[3px]',
}
//#endregion constants

//#region component
export function Spinner({ size = 'md', label = 'Đang tải', className, ...props }: ISpinnerProps) {
    return (
        <div
            role="status"
            aria-label={label}
            className={cn(
                'inline-flex shrink-0 animate-spin rounded-full border-slate-300 border-t-blue-600',
                spinnerSizeClass[size],
                className,
            )}
            {...props}
        >
            <span className="sr-only">{label}</span>
        </div>
    )
}
//#endregion component
