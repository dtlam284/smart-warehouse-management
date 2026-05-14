import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from './utils'

//#region types
export interface IErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
    message?: string | null
}
//#endregion types

//#region component
export function ErrorMessage({ message, className, ...props }: IErrorMessageProps) {
    if (!message) {
        return null
    }

    return (
        <div
            role="alert"
            className={cn(
                'flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
                className,
            )}
            {...props}
        >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    )
}
//#endregion component
