import { Button, ErrorMessage, Spinner } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectIsAllItemsHandled,
    selectIsLoadingPackageDetails,
    selectIsUpdatingPacking,
    selectPackingActiveDetail,
    selectPackingError,
    selectPackingScannedSKUs,
    selectScannedProgress,
} from '@/store/selectors/packingSelectors'
import { 
    clearActivePackingDetail, 
    completePacking 
} from '@/store/slices/packingSlice'
import { PackingEmptyPanel } from './PackingEmptyPanel'
import { PackingSKUItem } from './PackingSKUItem'

//#region component
export function PackingActivePanel() {
    const dispatch = useAppDispatch()

    const activeDetail = useAppSelector(selectPackingActiveDetail)
    const scannedSKUs = useAppSelector(selectPackingScannedSKUs)
    const progress = useAppSelector(selectScannedProgress)
    const isAllItemsHandled = useAppSelector(selectIsAllItemsHandled)
    const isLoadingDetail = useAppSelector(selectIsLoadingPackageDetails)
    const isUpdating = useAppSelector(selectIsUpdatingPacking)
    const error = useAppSelector(selectPackingError)

    const progressPercent =
        progress.total > 0 ? Math.round((progress.scanned / progress.total) * 100) : 0

    const handleCompletePacking = () => {
        if (!activeDetail || !isAllItemsHandled) {
            return
        }

        void dispatch(
            completePacking({
                DeliveryCodes: [activeDetail.Code],
                Type: 'DELIVERYCODE',
            }),
        )
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Kiện đang đóng gói
                </h2>

                <span className="rounded bg-blue-50 px-2 py-1 font-mono text-xs font-semibold text-blue-700">
                    PACKING
                </span>
            </div>

            {isLoadingDetail ? (
                <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
                    <Spinner size="sm" />
                    Đang tải thông tin kiện...
                </div>
            ) : null}

            {!isLoadingDetail && !activeDetail ? <PackingEmptyPanel /> : null}

            {!isLoadingDetail && activeDetail ? (
                <div className="space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h3 className="truncate text-base font-bold text-slate-900">
                                    {activeDetail.Name}
                                </h3>

                                <div className="mt-2">
                                    <span className="rounded bg-blue-50 px-2 py-1 font-mono text-xs font-semibold text-blue-700">
                                        {activeDetail.Code}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                <span>
                                    {progress.scanned} / {progress.total} sản phẩm đã quét
                                </span>
                                <span>{progressPercent}%</span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className={
                                        progressPercent === 100
                                            ? 'h-full rounded-full bg-green-600 transition-all'
                                            : 'h-full rounded-full bg-amber-500 transition-all'
                                    }
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {activeDetail.PackageDetails.map((item) => (
                            <PackingSKUItem
                                key={item.ListingPropertyCode}
                                item={item}
                                scannedCount={scannedSKUs[item.ListingPropertyCode] ?? 0}
                            />
                        ))}
                    </div>

                    <ErrorMessage message={error} />

                    <div className="flex gap-2">
                        <Button
                            fullWidth
                            variant="primary"
                            loading={isUpdating}
                            disabled={!isAllItemsHandled || isUpdating}
                            onClick={handleCompletePacking}
                        >
                            ✓ Hoàn thành đóng gói
                        </Button>

                        <Button
                            variant="secondary"
                            disabled={isUpdating}
                            onClick={() => dispatch(clearActivePackingDetail())}
                        >
                            Bỏ qua
                        </Button>
                    </div>

                    <p className="text-center text-xs text-slate-400">
                        Quét barcode SKU bằng máy quét để đếm. Hoàn thành khi tất cả đủ số lượng.
                    </p>
                </div>
            ) : null}
        </section>
    )
}
//#endregion component
