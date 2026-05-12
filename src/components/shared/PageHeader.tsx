import React from 'react'
import { cn } from '../../utils'
import { ChevronRight, Home } from 'lucide-react'
import { useI18n } from '../../contexts/I18nContext'

export interface PageHeaderProps {
    title: string
    description?: string
    breadcrumbs: { label: string; href?: string }[]
    actions?: React.ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    breadcrumbs,
    actions,
    className,
}: PageHeaderProps) {
    const { t } = useI18n()

    return (
        <div
            className={cn(
                'flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3',
                className,
            )}
        >
            <div className="min-w-0">
                <nav className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                    <a
                        href="/"
                        className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                        aria-label={t('Dashboard')}
                        title={t('Dashboard')}
                    >
                        <Home className="w-3.5 h-3.5" />
                    </a>
                    {breadcrumbs.map((crumb) => (
                        <React.Fragment key={crumb.label}>
                            <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400 dark:text-slate-500" />
                            {crumb.href ? (
                                <a
                                    href={crumb.href}
                                    className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                                >
                                    {t(crumb.label)}
                                </a>
                            ) : (
                                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                                    {t(crumb.label)}
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
                <h1 className="sr-only">{t(title)}</h1>
                {description ? <p className="sr-only">{t(description)}</p> : null}
            </div>
            {actions ? (
                <div className="flex items-center gap-2 self-start md:self-auto [&_[data-slot='button']]:h-8 [&_[data-slot='button']]:px-3">
                    {actions}
                </div>
            ) : null}
        </div>
    )
}
