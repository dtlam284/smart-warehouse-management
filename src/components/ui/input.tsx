import * as React from 'react'
import { cn } from './utils'

//#region types
export interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    wrapperClassName?: string
}
//#endregion types

//#region component
const Input = React.forwardRef<HTMLInputElement, IInputProps>(
    ({ className, wrapperClassName, label, error, helperText, id, type = 'text', ...props }, ref) => {
        const generatedId = React.useId()
        const inputId = id ?? generatedId
        const descriptionId = `${inputId}-description`
        const hasDescription = Boolean(error || helperText)

        return (
            <div className={cn('flex w-full flex-col gap-2', wrapperClassName)}>
                {label ? (
                    <label
                        htmlFor={inputId}
                        className="text-base font-bold text-slate-700 dark:text-slate-200"
                    >
                        {label}
                    </label>
                ) : null}

                <input
                    id={inputId}
                    ref={ref}
                    type={type}
                    aria-invalid={Boolean(error)}
                    aria-describedby={hasDescription ? descriptionId : undefined}
                    className={cn(
                        'flex h-13 min-h-13 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900',
                        error &&
                            'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900',
                        className,
                    )}
                    {...props}
                />

                {hasDescription ? (
                    <p
                        id={descriptionId}
                        className={cn(
                            'text-sm font-semibold leading-6',
                            error
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-slate-500 dark:text-slate-400',
                        )}
                    >
                        {error || helperText}
                    </p>
                ) : null}
            </div>
        )
    },
)

Input.displayName = 'Input'
//#endregion component

export { Input }
