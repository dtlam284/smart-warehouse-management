import { cn } from '@/components/ui/utils'
import { StatusChip, type StatusChipStatus } from '@/components/ui'
import type { IPackingProduct } from '@/models/packing/PackingInterface'


//#region types
interface IPackingSKUItemProps {
    item: IPackingProduct
    scannedCount: number
}
//#endregion types

//#region helpers
function getSKUStatus(scannedCount: number, requiredCount: number): StatusChipStatus {
    if (scannedCount >= requiredCount) {
        return 'complete'
    }

    if (scannedCount > 0) {
        return 'partial'
    }

    return 'pending'
}

function getSKUStatusClass(status: StatusChipStatus): string {
    switch (status) {
        case 'complete':
            return 'border-green-200 bg-green-50'

        case 'partial':
            return 'border-amber-200 bg-amber-50'

        case 'pending':
            return 'border-slate-200 bg-white'
    }
}
//#endregion helpers

//#region component
export function PackingSKUItem({ item, scannedCount }: IPackingSKUItemProps) {
    const status = getSKUStatus(scannedCount, item.Quantity)
    const safeScannedCount = Math.min(scannedCount, item.Quantity)

    return (
        <div
            className={cn(
                'grid grid-cols-[100px_150px_1fr_auto] items-center gap-3 rounded-md border px-3 py-2.5 transition-colors',
                getSKUStatusClass(status),
            )}
        >
            <StatusChip status={status} />

            <span className="font-mono text-xs font-semibold text-blue-700">
                {item.ListingPropertyCode}
            </span>

            <span className="min-w-0 truncate text-sm text-slate-600">
                {item.GroupServiceName ?? 'Không có tên sản phẩm'}
            </span>

            <span
                className={cn(
                    'whitespace-nowrap text-sm font-bold',
                    status === 'complete' && 'text-green-700',
                    status === 'partial' && 'text-amber-700',
                    status === 'pending' && 'text-slate-400',
                )}
            >
                {safeScannedCount} / {item.Quantity}
            </span>
        </div>
    )
}
//#endregion component
