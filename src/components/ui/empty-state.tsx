import * as React from 'react'
import { cn } from './utils'

//#region types
export interface IEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: React.ReactNode
    title: string
    description?: string
    action?: React.ReactNode
}
//#endregion types

//#region component
export function EmptyState({ icon, title, description, action, className, ...props }: IEmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-lg px-6 py-12 text-center',
                className,
            )}
            {...props}
        >
            {icon ? <div className="mb-3 text-4xl leading-none text-slate-400">{icon}</div> : null}

            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">{title}</h3>

            {description ? (
                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            ) : null}

            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    )
}
//#endregion component
