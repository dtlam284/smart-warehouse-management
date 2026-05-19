import { useAppSelector } from '@/store'
import {
    selectIsLoadingPackingStats,
    selectPackingStats,
} from '@/store/selectors/packingSelectors'
import { StatsCard } from './StatsCard'

//#region helpers
function getOptionalNumber(source: unknown, keys: string[]): number {
    if (!source || typeof source !== 'object') {
        return 0
    }

    const record = source as Record<string, unknown>

    for (const key of keys) {
        const value = record[key]

        if (typeof value === 'number') {
            return value
        }
    }

    return 0
}
//#endregion helpers

//#region component
export function PackingStatsSection() {
    const stats = useAppSelector(selectPackingStats)
    const isLoading = useAppSelector(selectIsLoadingPackingStats)

    const totalPacking = stats?.TotalPacking ?? 0
    const totalSalesOrder = stats?.TotalSalesOrder ?? 0
    const totalSkuHandled = getOptionalNumber(stats, [
        'TotalSkuHandled',
        'TotalSKUHandled',
        'TotalSku',
        'TotalSKU',
        'TotalItems',
    ])

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg font-black text-slate-900">
                    Thống kê đóng gói
                </h2>
                {/* <p className="text-sm text-slate-500">
                    Tổng quan số kiện và đơn hàng đã xử lý.
                </p> */}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Hôm nay đóng gói"
                    value={totalPacking}
                    // subtitle="kiện đã đóng"
                    loading={isLoading}
                    icon='📦'
                />

                <StatsCard
                    title="Tổng đơn hàng"
                    value={totalSalesOrder}
                    // subtitle="đơn trong phạm vi thống kê"
                    loading={isLoading}
                    icon='📦'
                />

                <StatsCard
                    title="SKU đã xử lý"
                    value={totalSkuHandled}
                    // subtitle="nếu API có trả dữ liệu SKU"
                    loading={isLoading}
                    icon='📦'
                />
            </div>
        </section>
    )
}
//#endregion component
