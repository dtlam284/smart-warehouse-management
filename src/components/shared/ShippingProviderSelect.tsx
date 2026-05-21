import type { IShippingProvider } from '@/models/warehouse/WarehouseInterface'

//#region types
interface IShippingProviderSelectProps {
    providers: IShippingProvider[]
    value: string | null
    disabled?: boolean
    onChange: (provider: { Id: string; Name: string }) => void
}
//#endregion types

//#region component
export function ShippingProviderSelect({
    providers,
    value,
    disabled = false,
    onChange,
}: IShippingProviderSelectProps) {
    const safeProviders = Array.isArray(providers) ? providers : []

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = event.target.value
        const selectedProvider = safeProviders.find((provider) => provider.Id === selectedId)

        onChange({
            Id: selectedProvider?.Id ?? '',
            Name: selectedProvider?.Name ?? '',
        })
    }

    return (
        <select
            value={value ?? ''}
            disabled={disabled || safeProviders.length === 0}
            onChange={handleChange}
            className="h-13 min-h-13 w-full rounded-lg border border-slate-300 bg-white px-4 text-base font-bold text-slate-900 outline-none transition-colors focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        >
            <option value="">Chọn đơn vị vận chuyển</option>

            {safeProviders.map((provider) => (
                <option key={provider.Id} value={provider.Id}>
                    {provider.Name}
                </option>
            ))}
        </select>
    )
}
//#endregion component
