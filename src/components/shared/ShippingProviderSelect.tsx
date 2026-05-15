import type { ShippingProvider } from '@/models/warehouse/WarehouseInterface'

//#region types
interface IShippingProviderSelectProps {
    providers: ShippingProvider[]
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
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = event.target.value
        const selectedProvider = providers.find((provider) => provider.Id === selectedId)

        onChange({
            Id: selectedProvider?.Id ?? '',
            Name: selectedProvider?.Name ?? '',
        })
    }

    return (
        <select
            value={value ?? ''}
            disabled={disabled || providers.length === 0}
            onChange={handleChange}
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        >
            <option value="">— Chọn đơn vị vận chuyển —</option>

            {providers.map((provider) => (
                <option key={provider.Id} value={provider.Id}>
                    {provider.Name}
                </option>
            ))}
        </select>
    )
}
//#endregion component
