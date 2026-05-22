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
        title: 'Hoàn toàn bộ',
        description: 'Toàn bộ đạt',
    },
    {
        type: 'DEFECTIVE_RETURN',
        icon: '❌',
        title: 'Hàng lỗi',
        description: 'Toàn bộ lỗi',
    },
    {
        type: 'PARTIAL_RETURN',
        icon: '⚠️',
        title: 'Hoàn một phần',
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
        <div className="grid gap-3 md:grid-cols-3">
            {returnTypeOptions.map((option) => {
                const isActive = value === option.type

                return (
                    <button
                        key={option.type}
                        type="button"
                        onClick={() => onChange(option.type)}
                        className={cn(
                            'min-h-[132px] rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-5 text-center transition-colors hover:border-slate-300 hover:bg-white',
                            isActive && activeClassByType[option.type],
                        )}
                    >
                        <span className="block text-4xl leading-none">
                            {option.icon}
                        </span>

                        <span className="mt-3 block text-base font-black">
                            {option.title}
                        </span>

                        <span
                            className={cn(
                                'mt-1 block text-sm font-semibold',
                                isActive ? 'text-current/75' : 'text-slate-500',
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
