import * as React from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from './utils'

//#region types
export interface INumberInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    label?: string
    error?: string
    helperText?: string
    wrapperClassName?: string
}
//#endregion types

//#region helpers
function clampValue(value: number, min: number, max?: number): number {
    const minValue = Math.max(min, 0)
    const maxValue = typeof max === 'number' ? max : Number.POSITIVE_INFINITY

    return Math.min(Math.max(value, minValue), maxValue)
}

function parseNumber(value: string): number {
    const parsed = Number(value)

    if (Number.isNaN(parsed)) {
        return 0
    }

    return parsed
}
//#endregion helpers

//#region component
export function NumberInput({
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    label,
    error,
    helperText,
    disabled,
    id,
    className,
    wrapperClassName,
    ...props
}: INumberInputProps) {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId = `${inputId}-description`
    const hasDescription = Boolean(error || helperText)

    const safeValue = clampValue(value, min, max)

    const updateValue = (nextValue: number) => {
        onChange(clampValue(nextValue, min, max))
    }

    const handleDecrease = () => {
        updateValue(safeValue - step)
    }

    const handleIncrease = () => {
        updateValue(safeValue + step)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateValue(parseNumber(event.target.value))
    }

    return (
        <div className={cn('flex w-full flex-col gap-1.5', wrapperClassName)}>
            {label ? (
                <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {label}
                </label>
            ) : null}

            <div
                className={cn(
                    'flex h-11 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:ring-blue-900',
                    error &&
                        'border-red-500 focus-within:border-red-500 focus-within:ring-red-200 dark:focus-within:ring-red-900',
                    disabled && 'cursor-not-allowed bg-slate-100 opacity-70 dark:bg-slate-900',
                    className,
                )}
            >
                <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={disabled || safeValue <= Math.max(min, 0)}
                    className="inline-flex h-full w-11 items-center justify-center border-r border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                    aria-label="Giảm số lượng"
                >
                    <Minus className="h-4 w-4" />
                </button>

                <input
                    id={inputId}
                    type="number"
                    min={Math.max(min, 0)}
                    max={max}
                    step={step}
                    value={safeValue}
                    onChange={handleChange}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={hasDescription ? descriptionId : undefined}
                    className="h-full min-w-0 flex-1 bg-transparent px-2 text-center text-sm font-semibold text-slate-900 outline-none disabled:cursor-not-allowed dark:text-slate-100"
                    {...props}
                />

                <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={disabled || (typeof max === 'number' && safeValue >= max)}
                    className="inline-flex h-full w-11 items-center justify-center border-l border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                    aria-label="Tăng số lượng"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {hasDescription ? (
                <p
                    id={descriptionId}
                    className={cn(
                        'text-xs leading-5',
                        error ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400',
                    )}
                >
                    {error || helperText}
                </p>
            ) : null}
        </div>
    )
}
//#endregion component
