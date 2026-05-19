import { EmptyState } from '@/components/ui'
import { useAppSelector } from '@/store'
import {
    selectHandoverStats,
    selectIsLoadingHandoverStats,
    selectTotalHandoverCount,
    selectTotalHandoverSalesOrderCount,
} from '@/store/selectors/handoverSelectors'
// import { ProviderProgressBar } from './ProviderProgressBar'
import { StatsCard } from './StatsCard'

//#region component
export function HandoverStatsSection() {
    const stats = useAppSelector(selectHandoverStats)
    const isLoading = useAppSelector(selectIsLoadingHandoverStats)
    const totalHandover = useAppSelector(selectTotalHandoverCount)
    const totalSalesOrder = useAppSelector(selectTotalHandoverSalesOrderCount)

    const providerStats = stats?.Statistics ?? []

    //#region render
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg font-black text-slate-900">
                    Thống kê bàn giao
                </h2>
                {/* <p className="text-sm text-slate-500">
                    Tiến độ bàn giao theo từng đơn vị vận chuyển.
                </p> */}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <StatsCard
                    title="Đã bàn giao"
                    value={totalHandover}
                    // subtitle="kiện đã bàn giao"
                    loading={isLoading}
                    icon='🚚'
                />

                <StatsCard
                    title="Tổng bàn giao"
                    value={totalSalesOrder}
                    // subtitle="đơn cần đối chiếu"
                    loading={isLoading}
                    icon='🚚'
                />
            </div>

             <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Theo đơn vị vận chuyển
                </h3>

                {isLoading ? (
                    <div className="grid gap-3 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-20 animate-pulse rounded-lg bg-slate-100"
                            />
                        ))}
                    </div>
                ) : null}

                {!isLoading && providerStats.length === 0 ? (
                    <EmptyState
                        title="Chưa có thống kê hàng hoàn"
                        description="Không có dữ liệu bàn giao cho ngày đang chọn."
                    />
                ) : null}

                {!isLoading && providerStats.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-3">
                        {providerStats.map((provider) => (
                            <div
                                key={provider.ShippingUnitId || provider.Name}
                                className="rounded-lg border border-slate-200 bg-purple-50 p-4"
                            >
                                <p className="text-2xl font-black text-purple-700">
                                    {provider.TotalHandover}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                    {provider.Name || '-'}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    )
    //#endregion render
}
//#endregion component
