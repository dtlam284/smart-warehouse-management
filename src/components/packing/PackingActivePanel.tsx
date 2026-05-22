import { Button, Spinner } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectIsAllItemsHandled,
    selectIsLoadingPackageDetails,
    selectIsUpdatingPacking,
    selectPackingActiveDetail,
    selectPackingActiveScanPayload,
    selectPackingScannedSKUs,
    selectScannedProgress,
} from '@/store/selectors/packingSelectors'
import {
    clearActivePackingDetail,
    completePacking,
} from '@/store/slices/packingSlice'
import { showNotification } from '@/store/slices/notificationSlice'
import { PackingEmptyPanel } from './PackingEmptyPanel'
import { PackingSKUItem } from './PackingSKUItem'
import type {
    IGetPackageDetailsRequest,
    IUpdatePackingRequest,
} from '@/models/packing/PackingDTO'

//#region helpers
function buildCompletePackingPayload(
    payload: IGetPackageDetailsRequest,
): IUpdatePackingRequest {
    return {
        DeliveryCodes: payload.DeliveryCode ? [payload.DeliveryCode] : undefined,
        PackageCode: payload.PackageCode,
        OrderCode: payload.OrderCode,
        OrderCodeRef: payload.OrderCodeRef,
        Type: payload.Type,
    }
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'string' && error.trim().length > 0) {
        return error
    }

    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message
    }

    return fallback
}
//#endregion helpers

//#region component
export function PackingActivePanel() {
    const dispatch = useAppDispatch()

    const activeDetail = useAppSelector(selectPackingActiveDetail)
    const activeScanPayload = useAppSelector(selectPackingActiveScanPayload)
    const scannedSKUs = useAppSelector(selectPackingScannedSKUs)
    const progress = useAppSelector(selectScannedProgress)
    const isAllItemsHandled = useAppSelector(selectIsAllItemsHandled)
    const isLoadingDetail = useAppSelector(selectIsLoadingPackageDetails)
    const isUpdating = useAppSelector(selectIsUpdatingPacking)

    const progressPercent =
        progress.total > 0 ? Math.round((progress.scanned / progress.total) * 100) : 0

    const handleCompletePacking = () => {
        if (!activeDetail || !activeScanPayload) {
            dispatch(
                showNotification({
                    type: 'warning',
                    message: 'Không tìm thấy đơn / kiện đang đóng gói',
                }),
            )
            return
        }

        if (!isAllItemsHandled) {
            dispatch(
                showNotification({
                    type: 'warning',
                    message: 'Chưa quét đủ số lượng SKU để hoàn thành đóng gói',
                }),
            )
            return
        }

        void dispatch(completePacking(buildCompletePackingPayload(activeScanPayload)))
            .unwrap()
            .then(() => {
                dispatch(
                    showNotification({
                        type: 'success',
                        message: `Đóng gói ${activeDetail.Code} thành công`,
                    }),
                )
            })
            .catch((error) => {
                dispatch(
                    showNotification({
                        type: 'error',
                        message: getErrorMessage(error, 'Không thể hoàn thành đóng gói'),
                    }),
                )
            })
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
                    Đơn / Kiện đang đóng gói
                </h2>

                <span className="rounded bg-blue-50 px-3 py-1 font-mono text-sm font-black text-blue-700">
                    ĐÓNG GÓI
                </span>
            </div>

            {isLoadingDetail ? (
                <div className="flex items-center justify-center gap-2 py-14 text-base font-semibold text-slate-500">
                    <Spinner size="sm" />
                    Đang tải thông tin kiện...
                </div>
            ) : null}

            {!isLoadingDetail && !activeDetail ? <PackingEmptyPanel /> : null}

            {!isLoadingDetail && activeDetail ? (
                <div className="space-y-5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h3 className="truncate text-xl font-black text-slate-900">
                                    {activeDetail.Name}
                                </h3>

                                <div className="mt-3">
                                    <span className="rounded bg-blue-50 px-3 py-1 font-mono text-base font-black text-blue-700">
                                        {activeDetail.Code}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between text-base font-bold text-slate-600">
                                <span>
                                    {progress.scanned} / {progress.total} sản phẩm đã quét
                                </span>
                                <span>{progressPercent}%</span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
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

                    <div className="space-y-3">
                        {activeDetail.PackageDetails.map((item) => {
                            const scannedCount = scannedSKUs[item.ListingPropertyCode] ?? 0

                            return (
                                <PackingSKUItem
                                    key={item.ListingPropertyCode}
                                    item={item}
                                    scannedCount={scannedCount}
                                />
                            )
                        })}
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_140px]">
                        <Button
                            className="min-w-0"
                            variant="primary"
                            loading={isUpdating}
                            disabled={isUpdating}
                            onClick={handleCompletePacking}
                        >
                            Hoàn thành đóng gói
                        </Button>

                        <Button
                            className="min-w-0"
                            variant="secondary"
                            disabled={isUpdating}
                            onClick={() => dispatch(clearActivePackingDetail())}
                        >
                            Bỏ qua
                        </Button>
                    </div>

                    <p className="text-center text-sm font-semibold text-slate-400">
                        Quét mã SKU bằng máy quét để đếm. Hoàn thành khi tất cả đủ số lượng.
                    </p>
                </div>
            ) : null}
        </section>
    )
}
//#endregion component
