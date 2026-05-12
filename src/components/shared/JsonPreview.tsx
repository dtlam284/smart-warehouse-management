import React from 'react'
import { toPrettyJson } from '@/utils/format'

/**
 * Standardized JSON output viewer.
 * Used for displaying API responses, debug outputs, and data previews.
 */
export interface JsonPreviewProps {
    data: unknown
    fallbackMessage?: string
    maxHeight?: string
    className?: string
}

export function JsonPreview({
    data,
    fallbackMessage = 'No data available.',
    maxHeight = 'max-h-64',
    className,
}: JsonPreviewProps) {
    const displayData = data ?? { message: fallbackMessage }

    return (
        <pre
            className={`overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-relaxed text-slate-100 dark:bg-slate-900 ${maxHeight} ${className ?? ''}`}
        >
            {toPrettyJson(displayData)}
        </pre>
    )
}
