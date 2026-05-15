import { NumberInput } from '@/components/ui'
import type { IReturnProduct } from '@/models/return/ReturnInterface'

//#region types
interface IReturnItemRowProps {
    item: IReturnProduct
    goodQty: number
    damagedQty: number
    error?: string
    disabled?: boolean
    onGoodQtyChange: (value: number) => void
    onDamagedQtyChange: (value: number) => void
}
//#endregion types

//#region component
export function ReturnItemRow({
    item,
    goodQty,
    damagedQty,
    error,
    disabled = false,
    onGoodQtyChange,
    onDamagedQtyChange,
}: IReturnItemRowProps) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="grid gap-3 lg:grid-cols-[1fr_120px_120px] lg:items-start">
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800">
                        {item.GroupServiceName}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="font-mono text-blue-700">{item.GroupServiceCode}</span>
                        <span>·</span>
                        <span>Tổng: {item.TotalQuantity}</span>
                    </div>

                    {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
                </div>

                <NumberInput
                    label="Đạt"
                    value={goodQty}
                    min={0}
                    max={item.TotalQuantity}
                    disabled={disabled}
                    onChange={onGoodQtyChange}
                />

                <NumberInput
                    label="Lỗi"
                    value={damagedQty}
                    min={0}
                    max={item.TotalQuantity}
                    disabled={disabled}
                    onChange={onDamagedQtyChange}
                />
            </div>
        </div>
    )
}
//#endregion component
