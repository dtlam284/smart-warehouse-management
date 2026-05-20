import * as React from 'react'
import { Button, Input } from '@/components/ui'
import { ShippingProviderSelect } from '@/components/shared/ShippingProviderSelect'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectScanInputType, selectSelectedShippingProviderId } from '@/store/selectors/appSelectors'
import { selectPackingFilters } from '@/store/selectors/packingSelectors'
import { selectShippingProviders } from '@/store/selectors/warehouseSelectors'
import { fetchPackingList, resetPackingFilters, setPackingFilters } from '@/store/slices/packingSlice'
import type { ScanInputType } from '@/models/common/CommonInterface'
import type { IPackingFilters } from '@/models/packing/PackingInterface'

//#region types
type CodeByType = Partial<Record<ScanInputType, string>>
//#endregion types

//#region helpers
function shouldUseShippingProvider(scanInputType: ScanInputType): boolean {
    return scanInputType !== 'DELIVERYCODE'
}

function buildCodeFilter(scanInputType: ScanInputType, code: string): Partial<IPackingFilters> {
    const normalizedCode = code.trim()

    const emptyCodeFilter: Partial<IPackingFilters> = {
        DeliveryCode: undefined,
        OrderCode: undefined,
        OrderCodeRef: undefined,
        PackageCode: undefined,
    }

    if (!normalizedCode) {
        return emptyCodeFilter
    }

    switch (scanInputType) {
        case 'DELIVERYCODE':
            return {
                ...emptyCodeFilter,
                DeliveryCode: normalizedCode,
            }

        case 'PACKAGECODE':
            return {
                ...emptyCodeFilter,
                PackageCode: normalizedCode,
            }

        case 'ORDERCODE':
            return {
                ...emptyCodeFilter,
                OrderCode: normalizedCode,
            }

        case 'ORDERCODEREF':
            return {
                ...emptyCodeFilter,
                OrderCodeRef: normalizedCode,
            }
    }
}

function getCodeFilterLabel(scanInputType: ScanInputType): string {
    switch (scanInputType) {
        case 'DELIVERYCODE':
            return 'Mã vận đơn'

        case 'PACKAGECODE':
            return 'Mã kiện'

        case 'ORDERCODE':
            return 'Mã đơn'

        case 'ORDERCODEREF':
            return 'Mã tham chiếu'
    }
}

function getCodeFilterPlaceholder(scanInputType: ScanInputType): string {
    switch (scanInputType) {
        case 'DELIVERYCODE':
            return 'Nhập mã vận đơn...'

        case 'PACKAGECODE':
            return 'Nhập mã kiện...'

        case 'ORDERCODE':
            return 'Nhập mã đơn...'

        case 'ORDERCODEREF':
            return 'Nhập mã tham chiếu...'
    }
}

function getInitialCodeByType(filters: IPackingFilters): CodeByType {
    return {
        DELIVERYCODE: filters.DeliveryCode ?? '',
        PACKAGECODE: filters.PackageCode ?? '',
        ORDERCODE: filters.OrderCode ?? '',
        ORDERCODEREF: filters.OrderCodeRef ?? '',
    }
}
//#endregion helpers

//#region component
export function PackingFilterBar() {
    const dispatch = useAppDispatch()

    const filters = useAppSelector(selectPackingFilters)
    const providers = useAppSelector(selectShippingProviders)
    const scanInputType = useAppSelector(selectScanInputType)
    const selectedShippingProviderId = useAppSelector(selectSelectedShippingProviderId)

    const [date, setDate] = React.useState(filters.Date ?? '')
    const [codeByType, setCodeByType] = React.useState<CodeByType>(() =>
        getInitialCodeByType(filters),
    )
    const [localShippingUnitId, setLocalShippingUnitId] = React.useState(
        filters.ShippingUnitId ?? '',
    )

    const shouldShowShippingProvider = shouldUseShippingProvider(scanInputType)
    const effectiveShippingUnitId = shouldShowShippingProvider
        ? selectedShippingProviderId || localShippingUnitId || filters.ShippingUnitId || ''
        : ''
    const currentCode = codeByType[scanInputType] ?? ''

    const handleCodeChange = (value: string) => {
        setCodeByType((current) => ({
            ...current,
            [scanInputType]: value,
        }))
    }

    const buildFilters = (shippingUnitId = effectiveShippingUnitId): IPackingFilters => ({
        ...filters,
        ...buildCodeFilter(scanInputType, currentCode),
        PageIndex: 1,
        PageSize: filters.PageSize,
        Date: date.trim() || undefined,
        ShippingUnitId: shouldShowShippingProvider ? shippingUnitId || undefined : undefined,
    })

    const handleApplyFilters = () => {
        const nextFilters = buildFilters()

        dispatch(setPackingFilters(nextFilters))
        void dispatch(fetchPackingList(nextFilters))
    }

    const handleShippingUnitChange = (provider: { Id: string; Name: string }) => {
        setLocalShippingUnitId(provider.Id)

        const nextFilters = buildFilters(provider.Id)

        dispatch(setPackingFilters(nextFilters))
        void dispatch(fetchPackingList(nextFilters))
    }

    const handleResetFilters = () => {
        const resetFilters: IPackingFilters = {
            PageIndex: 1,
            PageSize: filters.PageSize || 10,
            ShippingUnitId: shouldShowShippingProvider
                ? selectedShippingProviderId || undefined
                : undefined,
        }

        setDate('')
        setCodeByType({})
        setLocalShippingUnitId('')

        dispatch(resetPackingFilters())
        dispatch(setPackingFilters(resetFilters))
        void dispatch(fetchPackingList(resetFilters))
    }

    //#region render
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bộ lọc đóng gói
                </h2>
            </div>

            <div
                className={
                    shouldShowShippingProvider
                        ? 'grid items-end gap-3 lg:grid-cols-[180px_1fr_240px_auto_auto]'
                        : 'grid gap-3 lg:grid-cols-[180px_1fr_auto_auto]'
                }
            >
                <Input
                    type="date"
                    label="Ngày"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                />

                <div key={`packing-code-filter-${scanInputType}`}>
                    <Input
                        label={getCodeFilterLabel(scanInputType)}
                        placeholder={getCodeFilterPlaceholder(scanInputType)}
                        value={currentCode}
                        onChange={(event) => handleCodeChange(event.target.value)}
                    />
                </div>

                {shouldShowShippingProvider ? (
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-bold leading-6 text-slate-700">
                            Đơn vị vận chuyển
                        </label>

                        <ShippingProviderSelect
                            providers={providers}
                            value={effectiveShippingUnitId}
                            onChange={handleShippingUnitChange}
                        />
                    </div>
                ) : null}

                <div className="flex">
                    <Button onClick={handleApplyFilters}>Lọc</Button>
                </div>

                <div className="flex">
                    <Button variant="secondary" onClick={handleResetFilters}>
                        Đặt lại
                    </Button>
                </div>
            </div>
        </section>
    )
    //#endregion render
}
//#endregion component
