import { EmptyState, Spinner } from '@/components/ui'
import { cn } from '@/components/ui/utils'
import { useAppSelector } from '@/store'
import { 
    selectSelectedShippingProviderId 
} from '@/store/selectors/appSelectors'
import {
    selectIsLoadingReturnStats,
    selectReturnProviderStats,
    selectTotalReturnCount,
} from '@/store/selectors/returnSelectors'
import type { IReturnProviderStats } from '@/models/return/ReturnInterface'

//#region component
export function ReturnStatsBar() {
    const stats = useAppSelector(selectReturnProviderStats)
    const totalReturnCount = useAppSelector(selectTotalReturnCount)
    const isLoadingStats = useAppSelector(selectIsLoadingReturnStats)
    const selectedShippingProviderId = useAppSelector(selectSelectedShippingProviderId)

    if (isLoadingStats) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                    <Spinner size="sm" />
                    Đang tải thống kê hàng hoàn...
                </div>
            </section>
        )
    }

    if (stats.length === 0) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <EmptyState
                    title="Chưa có thống kê hàng hoàn"
                    // description="Thống kê sẽ hiển thị sau khi dữ liệu hàng hoàn được tải."
                />
            </section>
        )
    }

    //#region render
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex w-full flex-nowrap gap-3">
                {stats.map((stat: IReturnProviderStats) => {
                    const isActive = selectedShippingProviderId === stat.ShippingUnitId

                    return (
                        <div
                            key={stat.ShippingUnitId}
                            className={cn(
                                'min-w-0 flex-1 basis-0 rounded-lg border bg-white px-4 py-3 shadow-sm transition-colors',
                                isActive ? 'border-purple-500 bg-purple-50' : 'border-slate-200',
                            )}
                        >
                            <div
                                className={cn(
                                    'text-xl font-extrabold',
                                    isActive ? 'text-purple-700' : 'text-slate-900',
                                )}
                            >
                                {stat.TotalReturn}
                            </div>

                            <div
                                className={cn(
                                    'mt-1 truncate text-xs font-semibold',
                                    isActive ? 'text-purple-700' : 'text-slate-400',
                                )}
                            >
                                ↩️ {stat.Name}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                Tổng đơn hoàn hôm nay:{' '}
                <span className="font-bold text-purple-700">{totalReturnCount}</span>
            </div> */}
        </section>
    )
    //#endregion render
}
//#endregion component
