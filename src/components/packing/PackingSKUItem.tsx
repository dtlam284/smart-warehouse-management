import { StatusChip, type StatusChipStatus } from '@/components/ui/status-chip'
import { cn } from '@/components/ui/utils'
import type { IPackingProduct } from '@/models/packing/PackingInterface'

//#region types
interface IPackingSKUItemProps {
    item: IPackingProduct
    scannedCount: number
}
//#endregion types

//#region helpers
function getRequiredCount(value: number | undefined): number {
    if (typeof value !== 'number') {
        return 0
    }

    return Math.max(0, value)
}

function getSafeScannedCount(scannedCount: number, requiredCount: number): number {
    return Math.min(Math.max(scannedCount, 0), requiredCount)
}

function getSKUStatus(scannedCount: number, requiredCount: number): StatusChipStatus {
    if (requiredCount <= 0) {
        return 'pending'
    }

    if (scannedCount >= requiredCount) {
        return 'complete'
    }

    if (scannedCount > 0) {
        return 'partial'
    }

    return 'pending'
}

function getStatusLabel(status: StatusChipStatus): string {
    switch (status) {
        case 'complete':
            return 'Đủ'

        case 'partial':
            return 'Một phần'

        case 'pending':
            return 'Chưa quét'
    }
}

function getRowClass(status: StatusChipStatus): string {
    switch (status) {
        case 'complete':
            return 'border-green-200 bg-green-50'

        case 'partial':
            return 'border-amber-200 bg-amber-50'

        case 'pending':
            return 'border-slate-200 bg-white'
    }
}

function getQuantityClass(status: StatusChipStatus): string {
    switch (status) {
        case 'complete':
            return 'text-green-700'

        case 'partial':
            return 'text-amber-700'

        case 'pending':
            return 'text-slate-400'
    }
}
//#endregion helpers

//#region component
export function PackingSKUItem({ item, scannedCount }: IPackingSKUItemProps) {
    const requiredCount = getRequiredCount(item.Quantity)
    const safeScannedCount = getSafeScannedCount(scannedCount, requiredCount)
    const status = getSKUStatus(safeScannedCount, requiredCount)

    return (
        <div
            className={cn(
                'grid grid-cols-[100px_160px_1fr_auto] items-center gap-3 rounded-md border px-3 py-2.5 transition-colors',
                getRowClass(status),
            )}
        >
            <StatusChip
                key={`${item.ListingPropertyCode}-${status}-${safeScannedCount}`}
                status={status}
                label={getStatusLabel(status)}
            />

            <span className="font-mono text-xs font-semibold text-blue-700">
                {item.ListingPropertyCode}
            </span>

            <span className="min-w-0 truncate text-sm text-slate-600">
                {item.GroupServiceName || 'Không có tên sản phẩm'}
            </span>

            <span className={cn('whitespace-nowrap text-sm font-bold', getQuantityClass(status))}>
                {safeScannedCount} / {requiredCount}
            </span>
        </div>
    )
}
//#endregion component
