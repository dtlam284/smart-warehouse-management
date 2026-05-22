import { EmptyState } from '@/components/ui'
import { useAppSelector } from '@/store'
import {
    selectIsLoadingReturnStats,
    selectReturnProviderStats,
    selectReturnStats,
    selectTotalReturnCount,
} from '@/store/selectors/returnSelectors'
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
export function ReturnStatsSection() {
    const stats = useAppSelector(selectReturnStats)
    const providerStats = useAppSelector(selectReturnProviderStats)
    const totalReturn = useAppSelector(selectTotalReturnCount)
    const isLoading = useAppSelector(selectIsLoadingReturnStats)

    const fullReturn = getOptionalNumber(stats, [
        'TotalFullReturn',
        'FullReturn',
        'Full',
    ])

    const partialReturn = getOptionalNumber(stats, [
        'TotalPartialReturn',
        'PartialReturn',
        'Partial',
    ])

    const defectiveReturn = getOptionalNumber(stats, [
        'TotalDefectiveReturn',
        'DefectiveReturn',
        'Defective',
    ])

    //#region render
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg font-black text-slate-900">
                    Thống kê nhận hoàn
                </h2>
                {/* <p className="text-sm text-slate-500">
                    Tổng quan đơn hoàn và phân nhóm loại hoàn.
                </p> */}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <StatsCard
                    title="Đã nhận hoàn"
                    value={totalReturn}
                    // subtitle="đơn hoàn"
                    loading={isLoading}
                    icon='↩️'
                />

                <StatsCard
                    title="Hoàn toàn bộ"
                    value={fullReturn}
                    // subtitle="hoàn toàn bộ"
                    loading={isLoading}
                />

                <StatsCard
                    title="Hoàn một phần"
                    value={partialReturn}
                    // subtitle="hoàn một phần"
                    loading={isLoading}
                />

                <StatsCard
                    title="Hàng lỗi"
                    value={defectiveReturn}
                    // subtitle="hàng lỗi"
                    loading={isLoading}
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
                        description="Không có dữ liệu nhận hoàn cho ngày đang chọn."
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
                                    {provider.TotalReturn}
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
