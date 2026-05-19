import { useCallback, useState } from 'react'
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
    selectPackingActiveDetail,
    selectPackingScannedSKUs,
} from '@/store/selectors/packingSelectors'
import {
    addHandoverRecord,
    fetchHandoverList,
    removeHandoverRecord,
} from '@/store/slices/handoverSlice'
import { showNotification } from '@/store/slices/notificationSlice'
import { cancelPacking, incrementSKU, loadPackageDetails } from '@/store/slices/packingSlice'
import { loadReturnDetail, removeReturnRecord } from '@/store/slices/returnSlice'
import type { ScanInputType } from '@/models/common'

//#region types
interface IUseScanProcessorResult {
    scanError: string | null
    clearScanError: () => void
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
//#endregion helpers

//#region hook
export function useScanProcessor(): IUseScanProcessorResult {
    const dispatch = useAppDispatch()

    const workMode = useAppSelector(selectWorkMode)
    const scanInputType = useAppSelector(selectScanInputType)
    const isRemoveMode = useAppSelector(selectIsRemoveMode)
    const selectedShippingProviderId = useAppSelector(selectSelectedShippingProviderId)
    const activeDetail = useAppSelector(selectPackingActiveDetail)
    const scannedSKUs = useAppSelector(selectPackingScannedSKUs)
    const handoverFilters = useAppSelector(selectHandoverFilters)

    const [scanError, setScanError] = useState<string | null>(null)

    const clearScanError = useCallback(() => {
        setScanError(null)
    }, [])

    const requireShippingProvider = useCallback((): string | null => {
        if (!selectedShippingProviderId) {
            setScanError('Vui lòng chọn đơn vị vận chuyển trước khi quét')
            return null
        }

        return selectedShippingProviderId
    }, [selectedShippingProviderId])

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

    const handlePackingScan = useCallback(
        (code: string) => {
            const payload = buildWorkflowScanPayload(code)

            if (!payload) {
                return
            }

            if (isRemoveMode) {
                void dispatch(cancelPacking(payload as Parameters<typeof cancelPacking>[0]))
                return
            }

            if (!activeDetail) {
                void dispatch(loadPackageDetails(payload as Parameters<typeof loadPackageDetails>[0]))
                return
            }

            const matchedSKU = activeDetail.PackageDetails.find(
                (item) => item.ListingPropertyCode === code,
            )

            if (!matchedSKU) {
                setScanError('SKU không có trong kiện này')
                return
            }

            const currentScannedCount = scannedSKUs[matchedSKU.ListingPropertyCode] ?? 0

            if (currentScannedCount >= matchedSKU.Quantity) {
                dispatch(
                    showNotification({
                        type: 'warning',
                        message: `SKU ${matchedSKU.ListingPropertyCode} đã đủ số lượng`,
                    }),
                )
                return
            }

            dispatch(incrementSKU(code))
        },
        [activeDetail, buildWorkflowScanPayload, dispatch, isRemoveMode, scannedSKUs],
    )

    const handleHandoverScan = useCallback(
        (code: string) => {
            const payload = buildWorkflowScanPayload(code)

            if (!payload) {
                return
            }

            if (isRemoveMode) {
                void dispatch(removeHandoverRecord(payload as Parameters<typeof removeHandoverRecord>[0]))
                return
            }

            void dispatch(addHandoverRecord(payload as Parameters<typeof addHandoverRecord>[0]))
                .unwrap()
                .then(() => {
                    void dispatch(
                        fetchHandoverList({
                            ...handoverFilters,
                            PageIndex: 1,
                            PageSize: handoverFilters.PageSize ?? 10,
                            ShippingUnitId: payload.ShippingUnitId || undefined,
                        }),
                    )
                })
                .catch(() => {
                    // rejected error is stored in handover slice
                })
        },
        [buildWorkflowScanPayload, dispatch, handoverFilters, isRemoveMode],
    )

    const handleReturnScan = useCallback(
        (code: string) => {
            const payload = buildWorkflowScanPayload(code)

            if (!payload) {
                return
            }

            if (isRemoveMode) {
                void dispatch(removeReturnRecord(payload as Parameters<typeof removeReturnRecord>[0]))
                return
            }

            void dispatch(loadReturnDetail(payload as Parameters<typeof loadReturnDetail>[0]))
        },
        [buildWorkflowScanPayload, dispatch, isRemoveMode],
    )

    const handleScan = useCallback(
        (rawCode: string) => {
            const code = rawCode.trim().toUpperCase()

            if (!code) {
                return
            }

            setScanError(null)

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
                    setScanError('Vui lòng chọn chế độ làm việc trước khi quét')
            }
        },
        [handleHandoverScan, handlePackingScan, handleReturnScan, workMode],
    )

    return {
        scanError,
        clearScanError,
        handleScan,
    }
}
//#endregion hook
