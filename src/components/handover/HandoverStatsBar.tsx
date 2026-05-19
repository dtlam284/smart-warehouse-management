import { EmptyState, Spinner } from '@/components/ui'
import { cn } from '@/components/ui/utils'
import { useAppSelector } from '@/store'
import { selectSelectedShippingProviderId } from '@/store/selectors/appSelectors'
import {
    selectIsLoadingHandoverStats,
    selectProviderProgressList,
} from '@/store/selectors/handoverSelectors'
import {
    selectIsLoadingShippingProviders,
    selectShippingProviders,
} from '@/store/selectors/warehouseSelectors'
import type { IProviderProgress } from '@/models/handover/HandoverInterface'
import type { IShippingProvider } from '@/models/warehouse/WarehouseInterface'

//#region helpers
interface IHandoverProviderStatViewModel {
    ShippingUnitId: string
    Name: string
    TotalHandover: number
}

function buildProviderStats(
    providers: IShippingProvider[],
    stats: IProviderProgress[],
): IHandoverProviderStatViewModel[] {
    const statsByProviderId = new Map(
        stats.map((stat) => [stat.ShippingUnitId, stat]),
    )

    if (providers.length > 0) {
        return providers.map((provider) => {
            const stat = statsByProviderId.get(provider.Id)

            return {
                ShippingUnitId: provider.Id,
                Name: provider.Name,
                TotalHandover: stat?.TotalHandover ?? 0,
            }
        })
    }

    return stats.map((stat) => ({
        ShippingUnitId: stat.ShippingUnitId,
        Name: stat.Name,
        TotalHandover: stat.TotalHandover,
    }))
}
//#endregion helpers

//#region component
export function HandoverStatsBar() {
    const providers = useAppSelector(selectShippingProviders)
    const stats = useAppSelector(selectProviderProgressList)
    const isLoadingStats = useAppSelector(selectIsLoadingHandoverStats)
    const isLoadingProviders = useAppSelector(selectIsLoadingShippingProviders)
    const selectedShippingProviderId = useAppSelector(selectSelectedShippingProviderId)

    const isLoading = isLoadingStats || isLoadingProviders
    const providerStats = buildProviderStats(providers, stats)

    if (isLoading) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                    <Spinner size="sm" />
                    Đang tải thống kê bàn giao...
                </div>
            </section>
        )
    }

    if (providerStats.length === 0) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <EmptyState icon="🚚" title="Chưa có thống kê bàn giao" />
            </section>
        )
    }

    //#region render
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex w-full flex-nowrap gap-3">
                {providerStats.map((stat) => {
                    const isActive = selectedShippingProviderId === stat.ShippingUnitId

                    return (
                        <div
                            key={stat.ShippingUnitId}
                            className={cn(
                                'min-w-0 flex-1 basis-0 rounded-lg border bg-white px-4 py-3 shadow-sm transition-colors',
                                isActive ? 'border-green-500 bg-green-50' : 'border-slate-200',
                            )}
                        >
                            <div
                                className={cn(
                                    'text-xl font-extrabold',
                                    isActive ? 'text-green-700' : 'text-slate-900',
                                )}
                            >
                                {stat.TotalHandover}
                            </div>

                            <div
                                className={cn(
                                    'mt-1 truncate text-xs font-semibold',
                                    isActive ? 'text-green-700' : 'text-slate-400',
                                )}
                            >
                                🚚 {stat.Name}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
    //#endregion render
}
//#endregion component
