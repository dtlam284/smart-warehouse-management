//#region component
export function AppHeader() {
    return (
        <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-5 shadow-sm">
            <div className="text-base font-bold text-slate-900">
                Warehouse <span className="text-blue-600">Fulfillment</span>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>🏭 Kho Hà Nội</span>
                <span className="text-slate-300">|</span>
                <span className="font-medium text-green-600">● Online</span>
            </div>
        </header>
    )
}
//#endregion component
