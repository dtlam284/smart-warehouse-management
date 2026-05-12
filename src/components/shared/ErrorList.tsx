import React from 'react'

/**
 * Standardized error message banner list.
 * Renders a list of error messages with consistent rose-themed styling.
 */
export function ErrorList({ messages }: { messages: string[] }) {
    if (messages.length === 0) return null

    return (
        <>
            {messages.map((message) => (
                <p
                    key={message}
                    className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400"
                >
                    {message}
                </p>
            ))}
        </>
    )
}
