import type { ReturnType } from '@/models/return/ReturnInterface'
import { cn } from '@/components/ui/utils'

//#region types
interface IReturnTypeOption {
    type: ReturnType
    icon: string
    title: string
    description: string
}

interface IReturnTypeSelectorProps {
    value: ReturnType | null
    onChange: (type: ReturnType) => void
}
//#endregion types

//#region constants
const returnTypeOptions: IReturnTypeOption[] = [
    {
        type: 'FULL_RETURN',
        icon: '✅',
        title: 'Full Return',
        description: 'Toàn bộ đạt',
    },
    {
        type: 'DEFECTIVE_RETURN',
        icon: '❌',
        title: 'Defective',
        description: 'Toàn bộ lỗi',
    },
    {
        type: 'PARTIAL_RETURN',
        icon: '⚠️',
        title: 'Partial',
        description: 'Một phần',
    },
]

const activeClassByType: Record<ReturnType, string> = {
    FULL_RETURN: 'border-green-600 bg-green-50 text-green-700',
    DEFECTIVE_RETURN: 'border-red-600 bg-red-50 text-red-700',
    PARTIAL_RETURN: 'border-amber-600 bg-amber-50 text-amber-700',
}
//#endregion constants

//#region component
export function ReturnTypeSelector({ value, onChange }: IReturnTypeSelectorProps) {
    return (
        <div className="grid gap-2 md:grid-cols-3">
            {returnTypeOptions.map((option) => {
                const isActive = value === option.type

                return (
                    <button
                        key={option.type}
                        type="button"
                        onClick={() => onChange(option.type)}
                        className={cn(
                            'rounded-lg border-2 border-slate-200 bg-slate-50 px-3 py-3 text-center transition-colors hover:border-slate-300 hover:bg-white',
                            isActive && activeClassByType[option.type],
                        )}
                    >
                        <span className="block text-xl">{option.icon}</span>

                        <span className="mt-1 block text-xs font-bold">
                            {option.title}
                        </span>

                        <span
                            className={cn(
                                'mt-0.5 block text-xs',
                                isActive ? 'text-current/70' : 'text-slate-400',
                            )}
                        >
                            {option.description}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
//#endregion component
