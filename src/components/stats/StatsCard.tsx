import type * as React from 'react'

//#region types
interface IStatsCardProps {
    title: string
    value: number | string
    subtitle?: string
    icon?: React.ReactNode
    loading?: boolean
}
//#endregion types

//#region component
export function StatsCard({ title, value, subtitle, icon, loading = false }: IStatsCardProps) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {title}
                    </p>

                    {loading ? (
                        <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200" />
                    ) : (
                        <p className="mt-2 text-3xl font-black text-slate-900">
                            {value}
                        </p>
                    )}

                    {subtitle ? (
                        <p className="mt-2 text-sm text-slate-500">
                            {subtitle}
                        </p>
                    ) : null}
                </div>

                {icon ? (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        {icon}
                    </div>
                ) : null}
            </div>
        </article>
    )
}
//#endregion component
