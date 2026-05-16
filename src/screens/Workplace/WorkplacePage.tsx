import * as React from 'react'
import { Truck } from 'lucide-react'
import {
    HandoverFilterBar,
    HandoverRecordList,
    HandoverStatsBar,
} from '@/components/handover'
import { AppHeader } from '@/components/layout/AppHeader'
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
import { 
    ShippingProviderSelect 
} from '@/components/shared/ShippingProviderSelect'
import { Badge, EmptyState, ErrorMessage } from '@/components/ui'
import { useScanProcessor } from '@/hooks/useScanProcessor'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectIsRemoveMode,
    selectScanInputType,
    selectSelectedShippingProviderId,
    selectWorkMode,
} from '@/store/selectors/appSelectors'
import { selectShippingProviders } from '@/store/selectors/warehouseSelectors'
import {
    setScanInputType,
    setShippingProvider,
    setWorkMode,
    toggleRemoveMode,
} from '@/store/slices/appSlice'
import { fetchPackingList, loadPackingStats } from '@/store/slices/packingSlice'
import { fetchHandoverList, loadHandoverStats } from '@/store/slices/handoverSlice'
import { selectReturnFilters } from '@/store/selectors/returnSelectors'
import { fetchReturnList, loadReturnStats } from '@/store/slices/returnSlice'
import { loadShippingProviders } from '@/store/slices/warehouseSlice'
import { NotificationViewport } from '@/components/shared/NotificationViewport'
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

    if (workMode === 'PACKING') {
        return 'Quét mã kiện hoặc SKU...'
    }

    const placeholderByType: Record<ScanInputType, string> = {
        DELIVERYCODE: 'Quét mã kiện (DL...)...',
        PACKAGECODE: 'Quét package code...',
        ORDERCODE: 'Quét mã đơn hàng...',
        ORDERCODEREF: 'Quét mã tham chiếu...',
    }

    return placeholderByType[scanInputType]
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

function WorkplaceContent({ workMode }: { workMode: WorkMode }) {
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

    // console.log('Workplace providers from selector:', providers)

    const { scanError, handleScan } = useScanProcessor()

    const shouldShowShippingProvider = workMode === 'HANDOVER' || workMode === 'RETURN_DELIVERY'
    const scannerPlaceholder = getScannerPlaceholder(workMode, scanInputType, isRemoveMode)

    const handleModeChange = (mode: Exclude<WorkMode, 'NONE'>) => {
        dispatch(setWorkMode(mode))
    }

    const handleScanTypeChange = (type: ScanInputType) => {
        dispatch(setScanInputType(type))
    }

    //#region effects
    React.useEffect(() => {
        void dispatch(loadShippingProviders(undefined))
    }, [dispatch])

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
        if (workMode !== 'HANDOVER') {
            return
        }

        void dispatch(loadHandoverStats({}))

        void dispatch(
            fetchHandoverList({
                PageIndex: 1,
                PageSize: 10,
                ShippingUnitId: selectedShippingProviderId || undefined,
            }),
        )
    }, [dispatch, selectedShippingProviderId, workMode])

    React.useEffect(() => {
        if (workMode !== 'RETURN_DELIVERY') {
            return
        }

        void dispatch(loadReturnStats({}))

        void dispatch(
            fetchReturnList({
                PageIndex: 1,
                PageSize: returnFilters.PageSize ?? 10,
                ShippingUnitId: selectedShippingProviderId || undefined,
            }),
        )
    }, [dispatch, returnFilters.PageSize, selectedShippingProviderId, workMode])
    //#endregion effects
    
    //#region render
    return (
        <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
            <AppHeader />

            <div className="grid min-h-0 flex-1 grid-cols-[300px_1fr] overflow-hidden">
                <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white">
                    <section className="border-b border-slate-200 p-4">
                        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                            Chế độ làm việc
                        </div>
                        <ModeSelector value={workMode} onChange={handleModeChange} />
                    </section>

                    {shouldShowShippingProvider ? (
                        <section className="border-b border-slate-200 p-4">
                            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                                Đơn vị vận chuyển
                            </div>
                            <ShippingProviderSelect
                                providers={providers}
                                value={selectedShippingProviderId}
                                onChange={(provider) => dispatch(setShippingProvider(provider))}
                            />
                        </section>
                    ) : null}

                    <section className="border-b border-slate-200 p-4">
                        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                            Loại mã quét
                        </div>
                        <ScanTypeSelector value={scanInputType} onChange={handleScanTypeChange} />
                    </section>

                    <section className="border-b border-slate-200 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Nhập / quét mã
                            </span>

                            {isRemoveMode ? <Badge variant="error">XÓA</Badge> : null}
                        </div>

                        <ScannerInput
                            autoFocus
                            removeMode={isRemoveMode}
                            placeholder={scannerPlaceholder}
                            onScan={handleScan}
                        />

                        <button
                            type="button"
                            onClick={() => dispatch(toggleRemoveMode())}
                            className={
                                isRemoveMode
                                    ? 'mt-2 flex h-10 w-full items-center justify-center rounded-md border border-red-500 bg-red-50 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100'
                                    : 'mt-2 flex h-10 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100'
                            }
                        >
                            🗑 {isRemoveMode ? 'Tắt chế độ xóa' : 'Chế độ xóa'}
                        </button>

                        <div className="mt-3">
                            <ErrorMessage message={scanError} />
                        </div>
                    </section>

                    <section className="p-4">
                        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                            Gợi ý thao tác
                        </div>

                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                            <div className="flex items-center gap-2 font-semibold text-slate-600">
                                <Truck className="h-4 w-4" />
                                Scanner workflow
                            </div>
                            <p className="mt-2">
                                Nhấn Enter sau khi quét. Packing sẽ quét kiện trước, sau đó quét SKU.
                                Handover và Return bắt buộc chọn đơn vị vận chuyển.
                            </p>
                        </div>
                    </section>
                </aside>

                <main className="min-h-0 overflow-y-auto p-5">
                    <WorkplaceContent workMode={workMode} />
                </main>
            </div>
            
            <NotificationViewport />
        </div>
    )
    //#endregion render
}
//#endregion component
