import { EmptyState, Spinner } from '@/components/ui'
import { cn } from '@/components/ui/utils'
import { useAppSelector } from '@/store'
import {
    selectIsLoadingHandoverStats,
    selectProviderProgressList,
    selectTotalHandoverCount,
    selectTotalHandoverSalesOrderCount,
} from '@/store/selectors/handoverSelectors'
import { selectSelectedShippingProviderId } from '@/store/selectors/appSelectors'
import type { IProviderProgress } from '@/models/handover/HandoverInterface'

//#region helpers
function getProgressPercent(progress: IProviderProgress): number {
    if (progress.TotalSalesOrder <= 0) {
        return 0
    }

    return Math.min(100, Math.round((progress.TotalHandover / progress.TotalSalesOrder) * 100))
}
//#endregion helpers

//#region component
export function HandoverStatsBar() {
    const progressList = useAppSelector(selectProviderProgressList)
    const isLoadingStats = useAppSelector(selectIsLoadingHandoverStats)
    const selectedShippingProviderId = useAppSelector(selectSelectedShippingProviderId)
    const totalHandoverCount = useAppSelector(selectTotalHandoverCount)
    const totalSalesOrderCount = useAppSelector(selectTotalHandoverSalesOrderCount)

    if (isLoadingStats) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                    <Spinner size="sm" />
                    Đang tải thống kê bàn giao...
                </div>
            </section>
        )
    }

    if (progressList.length === 0) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <EmptyState
                    icon='🚚'
                    title="Chưa có thống kê bàn giao"
                    // description="Thống kê sẽ hiển thị sau khi dữ liệu bàn giao được tải."
                />
            </section>
        )
    }

    return (
        <section className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {progressList.map((progress) => {
                    const percent = getProgressPercent(progress)
                    const isActive = selectedShippingProviderId === progress.ShippingUnitId

                    return (
                        <div
                            key={progress.ShippingUnitId}
                            className={cn(
                                'rounded-lg border bg-white p-4 shadow-sm transition-colors',
                                isActive
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-slate-200',
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-xl font-extrabold text-slate-900">
                                        {progress.TotalHandover}
                                        <span className="ml-1 text-sm font-medium text-slate-400">
                                            / {progress.TotalSalesOrder}
                                        </span>
                                    </div>

                                    <div
                                        className={cn(
                                            'mt-1 truncate text-xs',
                                            isActive ? 'font-semibold text-green-700' : 'text-slate-400',
                                        )}
                                    >
                                        🚚 {progress.Name}
                                    </div>
                                </div>

                                {isActive ? (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                                        Đang chọn
                                    </span>
                                ) : null}
                            </div>

                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-green-600 transition-all"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                Tổng hôm nay:{' '}
                <span className="font-bold text-green-700">{totalHandoverCount}</span>
                <span className="text-slate-400"> / {totalSalesOrderCount} đơn</span>
            </div>
        </section>
    )
}
//#endregion component
