import React from 'react'
import { Languages } from 'lucide-react'
import { cn } from '../utils'
import { useI18n } from '../contexts/I18nContext'

export function LanguageToggle() {
    const { language, setLanguage } = useI18n()

    return (
        <div className="inline-flex h-9 items-center gap-1 rounded-full border border-slate-200 bg-white px-1 dark:border-slate-700 dark:bg-slate-900">
            <Languages className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={cn(
                    'h-7 rounded-full px-2 text-xs font-semibold transition-colors',
                    language === 'vi'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
            >
                VI
            </button>
            <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                    'h-7 rounded-full px-2 text-xs font-semibold transition-colors',
                    language === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
            >
                EN
            </button>
        </div>
    )
}
