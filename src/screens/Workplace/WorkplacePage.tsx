import * as React from 'react'
import {
    HandoverFilterBar,
    HandoverRecordList,
    HandoverStatsBar,
} from '@/components/handover'
import { ModeSelector } from '@/components/layout/ModeSelector'
import { ScanTypeSelector } from '@/components/layout/ScanTypeSelector'
import {
    PackingActivePanel,
    PackingFilterBar,
    PackingRecordList,
} from '@/components/packing'
import {
    ReturnActivePanel,
    ReturnFilterBar,
    ReturnRecordList,
    ReturnStatsBar,
} from '@/components/return'
import { ScannerInput } from '@/components/scanner/ScannerInput'
import { ShippingProviderSelect } from '@/components/shared/ShippingProviderSelect'
import { NotificationViewport } from '@/components/shared/NotificationViewport'
import { Badge, EmptyState } from '@/components/ui'
import { useScanProcessor } from '@/hooks/useScanProcessor'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectIsRemoveMode,
    selectScanInputType,
    selectSelectedShippingProviderId,
    selectWorkMode,
} from '@/store/selectors/appSelectors'
import { selectReturnFilters } from '@/store/selectors/returnSelectors'
import { selectShippingProviders } from '@/store/selectors/warehouseSelectors'
import {
    setScanInputType,
    setShippingProvider,
    setWorkMode,
    toggleRemoveMode,
} from '@/store/slices/appSlice'
import { fetchHandoverList, loadHandoverStats } from '@/store/slices/handoverSlice'
import { fetchPackingList, loadPackingStats } from '@/store/slices/packingSlice'
import { fetchReturnList, loadReturnStats, setReturnFilters } from '@/store/slices/returnSlice'
import { loadShippingProviders } from '@/store/slices/warehouseSlice'
import type { IShippingProvider } from '@/models/warehouse/WarehouseInterface'
import type { ScanInputType, WorkMode } from '@/models/common/CommonInterface'

//#region helpers
function getScannerPlaceholder(
    workMode: WorkMode,
    scanInputType: ScanInputType,
    isRemoveMode: boolean,
): string {
    if (isRemoveMode) {
        return 'Quét mã cần xóa...'
    }

    if (workMode === 'NONE') {
        return 'Chọn chế độ làm việc...'
    }

    const placeholderByType: Record<ScanInputType, string> = {
        DELIVERYCODE: 'Quét mã vận đơn...',
        PACKAGECODE: 'Quét mã kiện...',
        ORDERCODE: 'Quét mã đơn hàng...',
        ORDERCODEREF: 'Quét mã tham chiếu...',
    }

    return placeholderByType[scanInputType]
}

function shouldRequireShippingProvider(
    workMode: WorkMode,
    scanInputType: ScanInputType,
): boolean {
    if (workMode === 'PACKING') {
        return false
    }

    if (workMode === 'NONE') {
        return false
    }

    return scanInputType === 'DELIVERYCODE'
}

function getDefaultShippingProvider(
    providers: IShippingProvider[],
): Pick<IShippingProvider, 'Id' | 'Name'> | null {
    if (providers.length === 0) {
        return null
    }

    return (
        providers.find((provider) => provider.Name === 'J&T') ??
        providers.find((provider) => provider.Name.toLowerCase().includes('j&t')) ??
        providers[0]
    )
}
//#endregion helpers

//#region content
function PackingContent() {
    return (
        <div className="space-y-4">
            <PackingActivePanel />
            <PackingFilterBar />
            <PackingRecordList />
        </div>
    )
}

function HandoverContent() {
    return (
        <div className="space-y-4">
            <HandoverStatsBar />
            <HandoverFilterBar />
            <HandoverRecordList />
        </div>
    )
}

function ReturnContent() {
    return (
        <div className="space-y-4">
            <ReturnStatsBar />
            <ReturnActivePanel />
            <ReturnFilterBar />
            <ReturnRecordList />
        </div>
    )
}

function BlockedWorkflowContent() {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <EmptyState
                icon="🚚"
                title="Chọn đơn vị vận chuyển"
                description="Mã vận đơn cần chọn đơn vị vận chuyển trước khi quét hoặc tải dữ liệu."
            />
        </section>
    )
}

function WorkplaceContent({
    workMode,
    isBlocked,
}: {
    workMode: WorkMode
    isBlocked: boolean
}) {
    if (isBlocked) {
        return <BlockedWorkflowContent />
    }

    switch (workMode) {
        case 'PACKING':
            return <PackingContent />

        case 'HANDOVER':
            return <HandoverContent />

        case 'RETURN_DELIVERY':
            return <ReturnContent />

        case 'NONE':
            return (
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <EmptyState
                        title="Chọn chế độ làm việc"
                        description="Chọn một workflow ở panel bên trái để bắt đầu."
                    />
                </section>
            )
    }
}
//#endregion content

//#region component
export function WorkplacePage() {
    const dispatch = useAppDispatch()

    const workMode = useAppSelector(selectWorkMode)
    const scanInputType = useAppSelector(selectScanInputType)
    const returnFilters = useAppSelector(selectReturnFilters)
    const isRemoveMode = useAppSelector(selectIsRemoveMode)
    const providers = useAppSelector(selectShippingProviders)
    const selectedShippingProviderId = useAppSelector(selectSelectedShippingProviderId)

    const { handleScan } = useScanProcessor()
    const [focusSignal, setFocusSignal] = React.useState(0)

    const shouldShowShippingProvider = shouldRequireShippingProvider(workMode, scanInputType)
    const isWorkflowBlocked = shouldShowShippingProvider && !selectedShippingProviderId
    const scannerPlaceholder = getScannerPlaceholder(workMode, scanInputType, isRemoveMode)
    const returnPageSize = returnFilters.PageSize

    const focusScanner = () => {
        setFocusSignal((current) => current + 1)
    }

    const handleModeChange = (mode: Exclude<WorkMode, 'NONE'>) => {
        dispatch(setWorkMode(mode))
        focusScanner()
    }

    const handleScanTypeChange = (type: ScanInputType) => {
        dispatch(setScanInputType(type))
        focusScanner()
    }

    const handleShippingProviderChange = (provider: Pick<IShippingProvider, 'Id' | 'Name'>) => {
        dispatch(setShippingProvider(provider))
        focusScanner()
    }

    const handleToggleRemoveMode = () => {
        dispatch(toggleRemoveMode())
        focusScanner()
    }

    //#region effects
    React.useEffect(() => {
        void dispatch(loadShippingProviders(undefined))
    }, [dispatch])

    React.useEffect(() => {
        if (selectedShippingProviderId !== null) {
            return
        }

        const defaultProvider = getDefaultShippingProvider(providers)

        if (!defaultProvider) {
            return
        }

        dispatch(setShippingProvider(defaultProvider))
    }, [dispatch, providers, selectedShippingProviderId])

    React.useEffect(() => {
        if (workMode !== 'PACKING') {
            return
        }

        void dispatch(
            fetchPackingList({
                PageIndex: 1,
                PageSize: 10,
            }),
        )

        void dispatch(loadPackingStats({}))
    }, [dispatch, workMode])

    React.useEffect(() => {
        if (workMode !== 'HANDOVER' || isWorkflowBlocked) {
            return
        }

        void dispatch(loadHandoverStats({}))

        void dispatch(
            fetchHandoverList({
                PageIndex: 1,
                PageSize: 10,
            }),
        )
    }, [dispatch, isWorkflowBlocked, workMode])

    React.useEffect(() => {
        if (workMode !== 'RETURN_DELIVERY' || isWorkflowBlocked) {
            return
        }

        const nextFilters = {
            PageIndex: 1,
            PageSize: returnPageSize ?? 10,
        }

        dispatch(setReturnFilters(nextFilters))
        void dispatch(loadReturnStats({}))
        void dispatch(fetchReturnList(nextFilters))
    }, [dispatch, isWorkflowBlocked, returnPageSize, workMode])
    //#endregion effects

    //#region render
    return (
        <div className="grid min-h-0 flex-1 grid-cols-[300px_1fr] overflow-hidden bg-slate-100 text-slate-900">
            <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white">
                <section className="border-b border-slate-200 p-4">
                    <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Chế độ làm việc
                    </div>
                    <ModeSelector value={workMode} onChange={handleModeChange} />
                </section>

                <section className="border-b border-slate-200 p-4">
                    <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Loại mã quét
                    </div>
                    <ScanTypeSelector value={scanInputType} onChange={handleScanTypeChange} />
                </section>

                {shouldShowShippingProvider ? (
                    <section className="border-b border-slate-200 p-4">
                        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                            Đơn vị vận chuyển
                        </div>
                        <ShippingProviderSelect
                            providers={providers}
                            value={selectedShippingProviderId}
                            onChange={handleShippingProviderChange}
                        />
                    </section>
                ) : null}

                <section className="border-b border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Nhập / quét mã
                        </span>

                        {isRemoveMode ? <Badge variant="error">XÓA</Badge> : null}
                    </div>

                    <ScannerInput
                        autoFocus
                        focusSignal={focusSignal}
                        removeMode={isRemoveMode}
                        disabled={isWorkflowBlocked}
                        placeholder={scannerPlaceholder}
                        onScan={handleScan}
                    />

                    <button
                        type="button"
                        onClick={handleToggleRemoveMode}
                        className={
                            isRemoveMode
                                ? 'mt-2 flex h-10 w-full items-center justify-center rounded-md border border-red-500 bg-red-50 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100'
                                : 'mt-2 flex h-10 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100'
                        }
                    >
                        🗑 {isRemoveMode ? 'Tắt chế độ xóa' : 'Chế độ xóa'}
                    </button>
                </section>
            </aside>

            <main className="min-h-0 overflow-y-auto p-5">
                <WorkplaceContent workMode={workMode} isBlocked={isWorkflowBlocked} />
            </main>

            <NotificationViewport />
        </div>
    )
    //#endregion render
}
//#endregion component
