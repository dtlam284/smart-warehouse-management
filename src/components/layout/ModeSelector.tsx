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
        <div className="space-y-2">
            {modeOptions.map((option) => {
                const isActive = value === option.mode

                return (
                    <button
                        key={option.mode}
                        type="button"
                        onClick={() => onChange(option.mode)}
                        className={cn(
                            'flex min-h-16 w-full items-center gap-4 rounded-lg border border-transparent px-4 py-3 text-left transition-colors hover:bg-slate-50',
                            isActive
                                ? activeClassByMode[option.mode]
                                : 'text-slate-600 hover:text-slate-900',
                        )}
                    >
                        <span className="flex w-8 shrink-0 justify-center text-2xl">
                            {option.icon}
                        </span>

                        <span className="min-w-0">
                            <span className="block text-base font-black leading-6">
                                {option.title}
                            </span>
                            <span
                                className={cn(
                                    'block text-sm font-semibold leading-5',
                                    isActive ? 'text-current/80' : 'text-slate-500',
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
