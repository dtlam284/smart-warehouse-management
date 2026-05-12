import type { AppLanguage } from './translate'

let currentLanguage: AppLanguage = 'vi'

export const setCurrentLanguage = (language: AppLanguage): void => {
    currentLanguage = language
}

export const getCurrentLanguage = (): AppLanguage => currentLanguage

export const getCurrentLocaleTag = (): string => {
    return currentLanguage === 'vi' ? 'vi-VN' : 'en-US'
}
