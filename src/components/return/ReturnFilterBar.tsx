import * as React from 'react'
import { ShippingProviderSelect } from '@/components/shared/ShippingProviderSelect'
import { Button, Input } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectScanInputType, selectSelectedShippingProviderId } from '@/store/selectors/appSelectors'
import { selectReturnFilters } from '@/store/selectors/returnSelectors'
import { selectShippingProviders } from '@/store/selectors/warehouseSelectors'
import { fetchReturnList, resetReturnFilters, setReturnFilters } from '@/store/slices/returnSlice'
import type { ScanInputType } from '@/models/common/CommonInterface'
import type { IReturnFilters } from '@/models/return/ReturnInterface'

//#region helpers
function shouldUseShippingProvider(scanInputType: ScanInputType): boolean {
    return scanInputType !== 'DELIVERYCODE'
}

function buildCodeFilter(scanInputType: ScanInputType, code: string): Partial<IReturnFilters> {
    const normalizedCode = code.trim()

    const emptyCodeFilter = {
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

        case 'ORDERCODEREF':
            return {
                ...emptyCodeFilter,
                OrderCodeRef: normalizedCode,
            }

        case 'ORDERCODE':
            return {
                ...emptyCodeFilter,
                OrderCode: normalizedCode,
            }
    }
}

function getCodeFilterLabel(scanInputType: ScanInputType): string {
    switch (scanInputType) {
        case 'DELIVERYCODE':
            return 'Mã vận đơn'

        case 'PACKAGECODE':
            return 'Mã kiện'

        case 'ORDERCODEREF':
            return 'Mã tham chiếu'

        case 'ORDERCODE':
            return 'Mã đơn'
    }
}

function getCodeFilterPlaceholder(scanInputType: ScanInputType): string {
    switch (scanInputType) {
        case 'DELIVERYCODE':
            return 'Nhập mã vận đơn...'

        case 'PACKAGECODE':
            return 'Nhập mã kiện...'

        case 'ORDERCODEREF':
            return 'Nhập mã tham chiếu...'

        case 'ORDERCODE':
            return 'Nhập mã đơn...'
    }
}

function getInitialCodeValue(filters: IReturnFilters, scanInputType: ScanInputType): string {
    switch (scanInputType) {
        case 'DELIVERYCODE':
            return filters.DeliveryCode ?? ''

        case 'PACKAGECODE':
            return filters.PackageCode ?? ''

        case 'ORDERCODEREF':
            return filters.OrderCodeRef ?? ''

        case 'ORDERCODE':
            return filters.OrderCode ?? ''
    }
}
//#endregion helpers

//#region component
export function ReturnFilterBar() {
    const dispatch = useAppDispatch()

    const filters = useAppSelector(selectReturnFilters)
    const providers = useAppSelector(selectShippingProviders)
    const scanInputType = useAppSelector(selectScanInputType)
    const selectedShippingProviderId = useAppSelector(selectSelectedShippingProviderId)

    const [date, setDate] = React.useState(filters.Date ?? '')
    const [code, setCode] = React.useState(() => getInitialCodeValue(filters, scanInputType))

    const shouldShowShippingProvider = shouldUseShippingProvider(scanInputType)
    const effectiveShippingUnitId = shouldShowShippingProvider
        ? selectedShippingProviderId || filters.ShippingUnitId || ''
        : ''

    const buildFilters = (shippingUnitId = effectiveShippingUnitId): IReturnFilters => ({
        ...filters,
        ...buildCodeFilter(scanInputType, code),
        PageIndex: 1,
        PageSize: filters.PageSize,
        Date: date.trim() || undefined,
        ShippingUnitId: shouldShowShippingProvider ? shippingUnitId || undefined : undefined,
    })

    const handleApplyFilters = () => {
        const nextFilters = buildFilters()

        dispatch(setReturnFilters(nextFilters))
        void dispatch(fetchReturnList(nextFilters))
    }

    const handleShippingUnitChange = (provider: { Id: string; Name: string }) => {
        const nextFilters = buildFilters(provider.Id)

        dispatch(setReturnFilters(nextFilters))
        void dispatch(fetchReturnList(nextFilters))
    }

    const handleResetFilters = () => {
        const resetFilters: IReturnFilters = {
            PageIndex: 1,
            PageSize: filters.PageSize,
            ShippingUnitId: shouldShowShippingProvider
                ? selectedShippingProviderId || undefined
                : undefined,
        }

        setDate('')
        setCode('')

        dispatch(resetReturnFilters())
        dispatch(setReturnFilters(resetFilters))
        void dispatch(fetchReturnList(resetFilters))
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bộ lọc đơn hoàn
                </h2>
            </div>

            <div
                className={
                    shouldShowShippingProvider
                        ? 'grid gap-3 xl:grid-cols-[170px_1fr_230px_auto_auto]'
                        : 'grid gap-3 xl:grid-cols-[170px_1fr_auto_auto]'
                }
            >
                <Input
                    type="date"
                    label="Ngày"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                />

                <Input
                    label={getCodeFilterLabel(scanInputType)}
                    placeholder={getCodeFilterPlaceholder(scanInputType)}
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                />

                {shouldShowShippingProvider ? (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                            Đơn vị vận chuyển
                        </label>

                        <ShippingProviderSelect
                            providers={providers}
                            value={effectiveShippingUnitId}
                            onChange={handleShippingUnitChange}
                        />
                    </div>
                ) : null}

                <div className="flex items-end">
                    <Button onClick={handleApplyFilters}>Lọc</Button>
                </div>

                <div className="flex items-end">
                    <Button variant="secondary" onClick={handleResetFilters}>
                        Đặt lại
                    </Button>
                </div>
            </div>
        </section>
    )
}
//#endregion component
