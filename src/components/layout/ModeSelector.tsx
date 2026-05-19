import { cn } from '@/components/ui/utils'
import type { WorkMode } from '@/models/common'


//#region types
type SelectableWorkMode = Exclude<WorkMode, 'NONE'>

interface IModeOption {
    mode: SelectableWorkMode
    title: string
    description: string
    icon: string
}

interface IModeSelectorProps {
    value: WorkMode
    onChange: (mode: SelectableWorkMode) => void
}
//#endregion types

//#region constants
const modeOptions: IModeOption[] = [
    {
        mode: 'PACKING',
        title: 'Packing',
        description: 'Đóng gói hàng hóa',
        icon: '📦',
    },
    {
        mode: 'HANDOVER',
        title: 'Handover',
        description: 'Bàn giao vận chuyển',
        icon: '🚚',
    },
    {
        mode: 'RETURN_DELIVERY',
        title: 'Return Delivery',
        description: 'Nhận hàng hoàn trả',
        icon: '↩️',
    },
]

const activeClassByMode: Record<SelectableWorkMode, string> = {
    PACKING: 'border-blue-600 bg-blue-50 text-blue-700',
    HANDOVER: 'border-green-600 bg-green-50 text-green-700',
    RETURN_DELIVERY: 'border-purple-600 bg-purple-50 text-purple-700',
}
//#endregion constants

//#region component
export function ModeSelector({ value, onChange }: IModeSelectorProps) {
    return (
        <div className="space-y-1">
            {modeOptions.map((option) => {
                const isActive = value === option.mode

                return (
                    <button
                        key={option.mode}
                        type="button"
                        onClick={() => onChange(option.mode)}
                        className={cn(
                            'flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors hover:bg-slate-50',
                            isActive
                                ? activeClassByMode[option.mode]
                                : 'text-slate-600 hover:text-slate-900',
                        )}
                    >
                        <span className="flex w-6 justify-center text-lg">{option.icon}</span>

                        <span className="min-w-0">
                            <span className="block text-sm font-semibold">{option.title}</span>
                            <span
                                className={cn(
                                    'block text-xs',
                                    isActive ? 'text-current/70' : 'text-slate-400',
                                )}
                            >
                                {option.description}
                            </span>
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
//#endregion component
