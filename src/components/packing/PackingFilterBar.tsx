import * as React from 'react'
import { Button, Input } from '@/components/ui'
import { ShippingProviderSelect } from '@/components/shared/ShippingProviderSelect'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectPackingFilters } from '@/store/selectors/packingSelectors'
import { selectShippingProviders } from '@/store/selectors/warehouseSelectors'
import { fetchPackingList, resetPackingFilters, setPackingFilters } from '@/store/slices/packingSlice'
import type { IPackingFilters } from '@/models/packing/PackingInterface' 

//#region component
export function PackingFilterBar() {
    const dispatch = useAppDispatch()

    const filters = useAppSelector(selectPackingFilters)
    const providers = useAppSelector(selectShippingProviders)

    const [date, setDate] = React.useState(filters.Date ?? '')
    const [deliveryCode, setDeliveryCode] = React.useState(filters.DeliveryCode ?? '')
    const [shippingUnitId, setShippingUnitId] = React.useState(filters.ShippingUnitId ?? '')

    const buildFilters = (): IPackingFilters => ({
        ...filters,
        PageIndex: 0,
        Date: date.trim() || undefined,
        DeliveryCode: deliveryCode.trim() || undefined,
        ShippingUnitId: shippingUnitId || undefined,
    })

    const handleApplyFilters = () => {
        const nextFilters = buildFilters()

        dispatch(setPackingFilters(nextFilters))
        void dispatch(fetchPackingList(nextFilters))
    }

    const handleResetFilters = () => {
        const resetFilters: IPackingFilters = {
            PageIndex: 0,
            PageSize: filters.PageSize,
        }

        setDate('')
        setDeliveryCode('')
        setShippingUnitId('')

        dispatch(resetPackingFilters())
        void dispatch(fetchPackingList(resetFilters))
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bộ lọc kiện đã đóng
                </h2>
            </div>

            <div className="grid gap-3 lg:grid-cols-[180px_1fr_240px_auto_auto]">
                <Input
                    type="date"
                    label="Ngày"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                />

                <Input
                    label="Mã kiện"
                    placeholder="Nhập mã kiện..."
                    value={deliveryCode}
                    onChange={(event) => setDeliveryCode(event.target.value)}
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                        Đơn vị vận chuyển
                    </label>

                    <ShippingProviderSelect
                        providers={providers}
                        value={shippingUnitId}
                        onChange={(provider) => setShippingUnitId(provider.Id)}
                    />
                </div>

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
