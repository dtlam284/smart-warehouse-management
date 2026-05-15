import * as React from 'react'
import { CornerDownLeft } from 'lucide-react'
import { cn } from '@/components/ui/utils'

//#region types
export interface IScannerInputProps {
    onScan: (code: string) => void
    placeholder?: string
    disabled?: boolean
    autoFocus?: boolean
    removeMode?: boolean
}
//#endregion types

//#region component
export function ScannerInput({
    onScan,
    placeholder = 'Quét mã...',
    disabled = false,
    autoFocus = false,
    removeMode = false,
}: IScannerInputProps) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [value, setValue] = React.useState('')

    React.useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus()
        }
    }, [autoFocus])

    const submitScan = () => {
        const trimmedValue = value.trim()

        if (!trimmedValue) {
            return
        }

        onScan(trimmedValue)
        setValue('')
        inputRef.current?.focus()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            submitScan()
        }
    }

    return (
        <div className="relative">
            <input
                ref={inputRef}
                value={value}
                disabled={disabled}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoComplete="off"
                className={cn(
                    'h-11 w-full rounded-md border-2 border-slate-300 bg-slate-50 px-3 pr-12 font-mono text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
                    removeMode &&
                        'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-100',
                )}
            />

            <button
                type="button"
                onClick={submitScan}
                disabled={disabled}
                className={cn(
                    'absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300',
                    removeMode && 'bg-red-600 hover:bg-red-700',
                )}
                aria-label="Quét mã"
            >
                <CornerDownLeft className="h-4 w-4" />
            </button>
        </div>
    )
}
//#endregion component
