import { cn } from '@/components/ui/utils'
import type { ScanInputType } from '@/models/common'

//#region types
interface IScanTypeOption {
    type: ScanInputType
    label: string
}

interface IScanTypeSelectorProps {
    value: ScanInputType
    onChange: (type: ScanInputType) => void
}
//#endregion types

//#region constants
const scanTypeOptions: IScanTypeOption[] = [
    {
        type: 'DELIVERYCODE',
        label: 'Mã vận đơn',
    },
    {
        type: 'PACKAGECODE',
        label: 'Mã kiện',
    },
    {
        type: 'ORDERCODE',
        label: 'Mã đơn',
    },
    {
        type: 'ORDERCODEREF',
        label: 'Mã tham chiếu',
    },
]
//#endregion constants

//#region component
export function ScanTypeSelector({ value, onChange }: IScanTypeSelectorProps) {
    return (
        <div className="grid grid-cols-2 gap-1">
            {scanTypeOptions.map((option) => {
                const isActive = value === option.type

                return (
                    <button
                        key={option.type}
                        type="button"
                        onClick={() => onChange(option.type)}
                        className={cn(
                            'h-9 rounded-md border text-xs font-semibold transition-colors',
                            isActive
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
                        )}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
//#endregion component
