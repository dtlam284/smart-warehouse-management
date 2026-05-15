import * as React from 'react'
import { 
    ShippingProviderSelect
} from '@/components/shared/ShippingProviderSelect'
import { Button, Input } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectReturnFilters } from '@/store/selectors/returnSelectors'
import { selectShippingProviders } from '@/store/selectors/warehouseSelectors'
import {
    fetchReturnList,
    resetReturnFilters,
    setReturnFilters,
} from '@/store/slices/returnSlice'
import type { IReturnFilters } from '@/models/return/ReturnInterface'

//#region component
export function ReturnFilterBar() {
    const dispatch = useAppDispatch()

    const filters = useAppSelector(selectReturnFilters)
    const providers = useAppSelector(selectShippingProviders)

    const [date, setDate] = React.useState(filters.Date ?? '')
    const [deliveryCode, setDeliveryCode] = React.useState(filters.DeliveryCode ?? '')
    const [orderCode, setOrderCode] = React.useState(filters.OrderCode ?? '')
    const [shippingUnitId, setShippingUnitId] = React.useState(filters.ShippingUnitId ?? '')

    const buildFilters = (): IReturnFilters => ({
        ...filters,
        PageIndex: 0,
        Date: date.trim() || undefined,
        DeliveryCode: deliveryCode.trim() || undefined,
        OrderCode: orderCode.trim() || undefined,
        ShippingUnitId: shippingUnitId || undefined,
    })

    const handleApplyFilters = () => {
        const nextFilters = buildFilters()

        dispatch(setReturnFilters(nextFilters))
        void dispatch(fetchReturnList(nextFilters))
    }

    const handleResetFilters = () => {
        const resetFilters: IReturnFilters = {
            PageIndex: 0,
            PageSize: filters.PageSize,
        }

        setDate('')
        setDeliveryCode('')
        setOrderCode('')
        setShippingUnitId('')

        dispatch(resetReturnFilters())
        void dispatch(fetchReturnList(resetFilters))
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bộ lọc đơn hoàn
                </h2>
            </div>

            <div className="grid gap-3 xl:grid-cols-[170px_1fr_1fr_230px_auto_auto]">
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

                <Input
                    label="Mã đơn"
                    placeholder="Nhập mã đơn..."
                    value={orderCode}
                    onChange={(event) => setOrderCode(event.target.value)}
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
