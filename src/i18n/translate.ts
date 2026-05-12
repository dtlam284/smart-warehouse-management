import viTranslations from '@/translations/vi.json'
import enTranslations from '@/translations/en.json'

export type AppLanguage = 'vi' | 'en'

type TranslationParams = Record<string, string | number | boolean | null | undefined>

interface TranslationDictionary {
    exact: Record<string, string>
    words: Record<string, string>
}

const dictionaries: Record<AppLanguage, TranslationDictionary> = {
    vi: viTranslations,
    en: enTranslations,
}

const normalizeKey = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ')

const interpolate = (template: string, params?: TranslationParams): string => {
    if (!params) {
        return template
    }

    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        const value = params[key]
        if (value === null || value === undefined) {
            return ''
        }
        return String(value)
    })
}

const applyCase = (original: string, translated: string): string => {
    if (!translated) {
        return translated
    }

    if (original.toUpperCase() === original && original.length <= 5) {
        return translated.toUpperCase()
    }

    if (original[0] && original[0] === original[0].toUpperCase()) {
        return translated.charAt(0).toUpperCase() + translated.slice(1)
    }

    return translated
}

const splitCamelCase = (value: string): string[] => {
    return value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/\s+/g)
        .filter(Boolean)
}

const translateSimpleWord = (word: string, words: Record<string, string>): string | null => {
    const lookup = words[word.toLowerCase()]
    return lookup ?? null
}

const translateToken = (token: string, words: Record<string, string>): string => {
    const separators = /([/_-])/g
    const parts = token.split(separators)

    const translatedParts = parts.map((part) => {
        if (part === '/' || part === '_' || part === '-') {
            return part
        }

        const camelParts = splitCamelCase(part)
        if (camelParts.length > 1) {
            const translatedCamel = camelParts.map((segment) => {
                const translated = translateSimpleWord(segment, words)
                return translated ? applyCase(segment, translated) : segment
            })
            return translatedCamel.join(' ')
        }

        const translated = translateSimpleWord(part, words)
        if (!translated) {
            return part
        }

        return applyCase(part, translated)
    })

    return translatedParts.join('')
}

const translateByWords = (input: string, words: Record<string, string>): string => {
    return input.replace(/[A-Za-z][A-Za-z0-9/_-]*/g, (token) => translateToken(token, words))
}

export const translateLiteral = (input: string, language: AppLanguage): string => {
    if (language === 'en') {
        return input
    }

    const dictionary = dictionaries[language]
    if (!dictionary) {
        return input
    }

    const raw = String(input)
    const normalized = normalizeKey(raw)
    const exact = dictionary.exact[normalized]
    if (exact) {
        return exact
    }

    return translateByWords(raw, dictionary.words)
}

export const translateText = (
    key: string,
    language: AppLanguage,
    params?: TranslationParams,
): string => {
    const resolved = interpolate(key, params)
    return translateLiteral(resolved, language)
}
