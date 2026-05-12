import { getCurrentLocaleTag } from '@/i18n/runtime'

/**
 * Shared formatting utilities used across all CMS screens.
 * Centralises display helpers so every screen has consistent output.
 */

export const toDisplayDateTime = (value?: string | null): string => {
    if (!value) return 'N/A'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return new Intl.DateTimeFormat(getCurrentLocaleTag(), {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(parsed)
}

export const toDisplayDate = (value?: string | null): string => {
    if (!value) return 'N/A'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return new Intl.DateTimeFormat(getCurrentLocaleTag(), {
        dateStyle: 'medium',
    }).format(parsed)
}

export const parsePositiveInt = (value: string | null | undefined, fallback: number): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

export const toPrettyJson = (value: unknown): string => {
    try {
        return JSON.stringify(value ?? {}, null, 2)
    } catch {
        return String(value)
    }
}

export const toDateInputValue = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export const normalizeStatus = (value?: string | null): string => {
    if (!value) return 'neutral'
    return value.toLowerCase().replace(/\s+/g, '_')
}

export const toQueryErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message.trim()) {
        return `${fallback} (${error.message})`
    }
    return fallback
}

export const collectErrorMessages = (
    errors: Array<{ error: unknown; fallback: string; when?: boolean }>,
): string[] => {
    const messages = errors
        .filter((item) => (item.when ?? true) && Boolean(item.error))
        .map((item) => toQueryErrorMessage(item.error, item.fallback))
    return Array.from(new Set(messages))
}
