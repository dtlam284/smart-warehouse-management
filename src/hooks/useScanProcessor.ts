import { useCallback } from 'react'
import { buildScanPayload } from '@/models/common'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectIsRemoveMode,
    selectScanInputType,
    selectSelectedShippingProviderId,
    selectWorkMode,
} from '@/store/selectors/appSelectors'
import { selectHandoverFilters } from '@/store/selectors/handoverSelectors'
import {
    selectIsAllItemsHandled,
    selectPackingActiveDetail,
    selectPackingActiveScanPayload,
    selectPackingScannedSKUs,
} from '@/store/selectors/packingSelectors'
import {
    addHandoverRecord,
    fetchHandoverList,
    removeHandoverRecord,
} from '@/store/slices/handoverSlice'
import { showNotification } from '@/store/slices/notificationSlice'
import {
    cancelPacking,
    completePacking,
    incrementSKU,
    loadPackageDetails,
} from '@/store/slices/packingSlice'
import { loadReturnDetail, removeReturnRecord } from '@/store/slices/returnSlice'
import type { ScanInputType } from '@/models/common'
import type {
    IGetPackageDetailsRequest,
    IUpdatePackingRequest,
} from '@/models/packing/PackingDTO'

//#region types
interface IUseScanProcessorResult {
    handleScan: (code: string) => void
}

type WorkflowScanPayload = ReturnType<typeof buildScanPayload> & {
    ShippingUnitId?: string
}
//#endregion types

//#region helpers
function shouldAttachShippingUnit(scanInputType: ScanInputType): boolean {
    return scanInputType !== 'DELIVERYCODE'
}

function normalizeCode(value?: string | null): string {
    return value?.trim().toUpperCase() ?? ''
}

function getPackingCodeFromPayload(payload: IGetPackageDetailsRequest | null): string {
    if (!payload) {
        return ''
    }

    return normalizeCode(
        payload.DeliveryCode ??
            payload.PackageCode ??
            payload.OrderCode ??
            payload.OrderCodeRef ??
            '',
    )
}

function buildCompletePackingPayload(payload: IGetPackageDetailsRequest): IUpdatePackingRequest {
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

//#region hook
export function useScanProcessor(): IUseScanProcessorResult {
    const dispatch = useAppDispatch()

    const workMode = useAppSelector(selectWorkMode)
    const scanInputType = useAppSelector(selectScanInputType)
    const isRemoveMode = useAppSelector(selectIsRemoveMode)
    const selectedShippingProviderId = useAppSelector(selectSelectedShippingProviderId)
    const activeDetail = useAppSelector(selectPackingActiveDetail)
    const activeScanPayload = useAppSelector(selectPackingActiveScanPayload)
    const scannedSKUs = useAppSelector(selectPackingScannedSKUs)
    const isAllPackingItemsHandled = useAppSelector(selectIsAllItemsHandled)
    const handoverFilters = useAppSelector(selectHandoverFilters)

    const notifyScanWarning = useCallback(
        (message: string) => {
            dispatch(
                showNotification({
                    type: 'warning',
                    message,
                }),
            )
        },
        [dispatch],
    )

    const notifyScanError = useCallback(
        (message: string) => {
            dispatch(
                showNotification({
                    type: 'error',
                    message,
                }),
            )
        },
        [dispatch],
    )

    const notifyScanSuccess = useCallback(
        (message: string) => {
            dispatch(
                showNotification({
                    type: 'success',
                    message,
                }),
            )
        },
        [dispatch],
    )

    const requireShippingProvider = useCallback((): string | null => {
        if (!selectedShippingProviderId) {
            notifyScanWarning(
                'Mã này cần chọn đơn vị vận chuyển trước khi xử lý. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
            return null
        }

        return selectedShippingProviderId
    }, [notifyScanWarning, selectedShippingProviderId])

    const buildWorkflowScanPayload = useCallback(
        (code: string): WorkflowScanPayload | null => {
            const basePayload = buildScanPayload(code, scanInputType)

            if (!shouldAttachShippingUnit(scanInputType)) {
                return basePayload
            }

            const shippingUnitId = requireShippingProvider()

            if (!shippingUnitId) {
                return null
            }

            return {
                ...basePayload,
                ShippingUnitId: shippingUnitId,
            }
        },
        [requireShippingProvider, scanInputType],
    )

    const loadNewPackingDetail = useCallback(
        (code: string) => {
            const payload = buildWorkflowScanPayload(code)

            if (!payload) {
                return
            }

            void dispatch(loadPackageDetails(payload as Parameters<typeof loadPackageDetails>[0]))
                .unwrap()
                .catch((error) => {
                    notifyScanError(getErrorMessage(error, 'Không thể tải thông tin đóng gói'))
                })
        },
        [buildWorkflowScanPayload, dispatch, notifyScanError],
    )

    const completeCurrentPacking = useCallback(() => {
        if (!activeScanPayload) {
            notifyScanWarning('Không tìm thấy mã đóng gói hiện tại')
            return
        }

        if (!isAllPackingItemsHandled) {
            notifyScanWarning('Chưa quét đủ số lượng SKU để hoàn thành đóng gói')
            return
        }

        void dispatch(completePacking(buildCompletePackingPayload(activeScanPayload)))
            .unwrap()
            .then(() => {
                notifyScanSuccess('Hoàn thành đóng gói thành công')
            })
            .catch((error) => {
                notifyScanError(getErrorMessage(error, 'Không thể hoàn thành đóng gói'))
            })
    }, [
        activeScanPayload,
        dispatch,
        isAllPackingItemsHandled,
        notifyScanError,
        notifyScanSuccess,
        notifyScanWarning,
    ])

    const handlePackingScan = useCallback(
        (code: string) => {
            if (isRemoveMode) {
                const payload = buildWorkflowScanPayload(code)

                if (!payload) {
                    return
                }

                void dispatch(cancelPacking(payload as Parameters<typeof cancelPacking>[0]))
                    .unwrap()
                    .catch((error) => {
                        notifyScanError(getErrorMessage(error, 'Không thể xóa đóng gói'))
                    })

                return
            }

            if (!activeDetail) {
                loadNewPackingDetail(code)
                return
            }

            const normalizedScannedCode = normalizeCode(code)
            const activePackingCode =
                getPackingCodeFromPayload(activeScanPayload) || normalizeCode(activeDetail.Code)

            if (normalizedScannedCode === activePackingCode) {
                completeCurrentPacking()
                return
            }

            const matchedSKU = activeDetail.PackageDetails.find((item) => {
                return normalizeCode(item.ListingPropertyCode) === normalizedScannedCode
            })

            if (matchedSKU) {
                const currentScannedCount = scannedSKUs[matchedSKU.ListingPropertyCode] ?? 0

                if (currentScannedCount >= matchedSKU.Quantity) {
                    notifyScanWarning(`SKU ${matchedSKU.ListingPropertyCode} đã đủ số lượng`)
                    return
                }

                dispatch(incrementSKU(matchedSKU.ListingPropertyCode))
                return
            }

            loadNewPackingDetail(code)
        },
        [
            activeDetail,
            activeScanPayload,
            buildWorkflowScanPayload,
            completeCurrentPacking,
            dispatch,
            isRemoveMode,
            loadNewPackingDetail,
            notifyScanError,
            notifyScanWarning,
            scannedSKUs,
        ],
    )

    const handleHandoverScan = useCallback(
        (code: string) => {
            const payload = buildWorkflowScanPayload(code)

            if (!payload) {
                return
            }

            if (isRemoveMode) {
                void dispatch(removeHandoverRecord(payload as Parameters<typeof removeHandoverRecord>[0]))
                    .unwrap()
                    .catch((error) => {
                        notifyScanError(getErrorMessage(error, 'Không thể xóa bản ghi bàn giao'))
                    })

                return
            }

            void dispatch(addHandoverRecord(payload as Parameters<typeof addHandoverRecord>[0]))
                .unwrap()
                .then(() => {
                    notifyScanSuccess('Bàn giao mã vừa quét thành công')

                    void dispatch(
                        fetchHandoverList({
                            ...handoverFilters,
                            PageIndex: 1,
                            PageSize: handoverFilters.PageSize ?? 10,
                            ShippingUnitId: payload.ShippingUnitId || undefined,
                        }),
                    )
                })
                .catch((error) => {
                    notifyScanError(getErrorMessage(error, 'Không thể bàn giao mã vừa quét'))
                })
        },
        [
            buildWorkflowScanPayload,
            dispatch,
            handoverFilters,
            isRemoveMode,
            notifyScanError,
            notifyScanSuccess,
        ],
    )

    const handleReturnScan = useCallback(
        (code: string) => {
            const payload = buildWorkflowScanPayload(code)

            if (!payload) {
                return
            }

            if (isRemoveMode) {
                void dispatch(removeReturnRecord(payload as Parameters<typeof removeReturnRecord>[0]))
                    .unwrap()
                    .catch((error) => {
                        notifyScanError(getErrorMessage(error, 'Không thể xóa bản ghi hoàn'))
                    })

                return
            }

            void dispatch(loadReturnDetail(payload as Parameters<typeof loadReturnDetail>[0]))
                .unwrap()
                .catch((error) => {
                    notifyScanError(getErrorMessage(error, 'Không thể tải thông tin hoàn trả'))
                })
        },
        [buildWorkflowScanPayload, dispatch, isRemoveMode, notifyScanError],
    )

    const handleScan = useCallback(
        (rawCode: string) => {
            const code = rawCode.trim().toUpperCase()

            if (!code) {
                return
            }

            switch (workMode) {
                case 'PACKING':
                    handlePackingScan(code)
                    return

                case 'HANDOVER':
                    handleHandoverScan(code)
                    return

                case 'RETURN_DELIVERY':
                    handleReturnScan(code)
                    return

                case 'NONE':
                    notifyScanWarning('Vui lòng chọn chế độ làm việc trước khi quét')
            }
        },
        [
            handleHandoverScan,
            handlePackingScan,
            handleReturnScan,
            notifyScanWarning,
            workMode,
        ],
    )

    return {
        handleScan,
    }
}
//#endregion hook
