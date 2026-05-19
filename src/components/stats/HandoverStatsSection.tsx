import { EmptyState } from '@/components/ui'
import { useAppSelector } from '@/store'
import {
    selectHandoverStats,
    selectIsLoadingHandoverStats,
    selectTotalHandoverCount,
    selectTotalHandoverSalesOrderCount,
} from '@/store/selectors/handoverSelectors'
import { ProviderProgressBar } from './ProviderProgressBar'
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
                    title="Tổng đơn"
                    value={totalSalesOrder}
                    // subtitle="đơn cần đối chiếu"
                    loading={isLoading}
                    icon='🚚'
                />
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                          <ProviderProgressBar
                              key={index}
                              providerName=""
                              current={0}
                              total={0}
                              loading
                          />
                      ))
                    : null}

                {!isLoading && providerStats.length === 0 ? (
                    <EmptyState
                        title="Chưa có thống kê bàn giao"
                        // description="Không có dữ liệu bàn giao cho ngày đang chọn."
                    />
                ) : null}

                {!isLoading
                    ? providerStats.map((provider) => (
                          <ProviderProgressBar
                              key={provider.ShippingUnitId || provider.Name}
                              providerName={provider.Name || '-'}
                              current={provider.TotalHandover}
                              total={provider.TotalSalesOrder}
                          />
                      ))
                    : null}
            </div>
        </section>
    )
    //#endregion render
}
//#endregion component
