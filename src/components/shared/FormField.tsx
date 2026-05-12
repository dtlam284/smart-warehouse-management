import React from 'react'
import { cn } from '../../utils'

/**
 * Standardized form field wrapper with label and optional hint text.
 * Ensures consistent spacing and labeling across all admin forms.
 */
export interface FormFieldProps {
    label: string
    hint?: string
    htmlFor?: string
    required?: boolean
    className?: string
    children: React.ReactNode
}

export function FormField({ label, hint, htmlFor, required, className, children }: FormFieldProps) {
    return (
        <label htmlFor={htmlFor} className={cn('block space-y-1.5', className)}>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
                {required && <span className="ml-0.5 text-rose-500">*</span>}
            </span>
            {children}
            {hint && (
                <span className="block text-xs text-slate-400 dark:text-slate-500">{hint}</span>
            )}
        </label>
    )
}

/**
 * Standardized text input with consistent styling.
 * Use this across all admin forms for uniform appearance.
 */
export const inputClassName =
    'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 transition-colors'

export const selectClassName =
    'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 transition-colors'

export const textareaClassName =
    'min-h-[96px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 resize-y transition-colors'
