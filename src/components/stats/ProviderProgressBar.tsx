//#region types
interface IProviderProgressBarProps {
    providerName: string
    current: number
    total: number
    loading?: boolean
}
//#endregion types

//#region helpers
function getSafePercentage(current: number, total: number): number {
    if (total <= 0) {
        return 0
    }

    return Math.min(100, Math.max(0, Math.round((current / total) * 100)))
}
//#endregion helpers

//#region component
export function ProviderProgressBar({
    providerName,
    current,
    total,
    loading = false,
}: IProviderProgressBarProps) {
    const percentage = getSafePercentage(current, total)

    if (loading) {
        return (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-2 w-full animate-pulse rounded bg-slate-200" />
            </div>
        )
    }

    //#region render
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                        {providerName}
                    </p>
                    <p className="text-xs text-slate-500">
                        {current} / {total} kiện đã bàn giao
                    </p>
                </div>

                <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                    {percentage}%
                </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                    className="h-full rounded-full bg-green-600 transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
    //#endregion render
}
//#endregion component