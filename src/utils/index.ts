import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getCurrentLocaleTag } from '../i18n/runtime'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatNumber(num: number) {
    return new Intl.NumberFormat(getCurrentLocaleTag()).format(num)
}
