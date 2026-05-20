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
                'flex items-start gap-4 rounded-2xl border-2 border-red-300 bg-red-50 px-8 py-5 text-xl font-black text-red-700 shadow-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300',
                className,
            )}
            {...props}
        >
            <AlertTriangle className="mt-0.5 h-8 w-8 shrink-0" />
            <span className="leading-8">{message}</span>
        </div>
    )
}
//#endregion component
