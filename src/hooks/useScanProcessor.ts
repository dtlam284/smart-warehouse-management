import { useCallback, useState } from 'react'
import { buildScanPayload } from '@/models/common'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectIsRemoveMode,
    selectScanInputType,
    selectSelectedShippingProviderId,
    selectWorkMode,
} from '@/store/selectors/appSelectors'
import { selectPackingActiveDetail } from '@/store/selectors/packingSelectors'
import { addHandoverRecord, removeHandoverRecord } from '@/store/slices/handoverSlice'
import { cancelPacking, incrementSKU, loadPackageDetails } from '@/store/slices/packingSlice'
import { loadReturnDetail, removeReturnRecord } from '@/store/slices/returnSlice'

//#region types
interface IUseScanProcessorResult {
    scanError: string | null
    clearScanError: () => void
    handleScan: (code: string) => void
}
//#endregion types

//#region hook
export function useScanProcessor(): IUseScanProcessorResult {
    const dispatch = useAppDispatch()

    const workMode = useAppSelector(selectWorkMode)
    const scanInputType = useAppSelector(selectScanInputType)
    const isRemoveMode = useAppSelector(selectIsRemoveMode)
    const selectedShippingProviderId = useAppSelector(selectSelectedShippingProviderId)
    const activeDetail = useAppSelector(selectPackingActiveDetail)

    const [scanError, setScanError] = useState<string | null>(null)

    const clearScanError = useCallback(() => {
        setScanError(null)
    }, [])

    const requireShippingProvider = useCallback((): string | null => {
        if (!selectedShippingProviderId) {
            return 'Vui lòng chọn đơn vị vận chuyển trước khi quét'
        }

        return selectedShippingProviderId
    }, [selectedShippingProviderId])

    const handlePackingScan = useCallback(
        (code: string) => {
            const payload = buildScanPayload(code, scanInputType)

            if (isRemoveMode) {
                const removePayload = {
                    ...payload,
                    ShippingUnitId: selectedShippingProviderId ?? '',
                }

                void dispatch(cancelPacking(removePayload))
                return
            }

            if (!activeDetail) {
                void dispatch(loadPackageDetails(payload))
                return
            }

            const matchedSKU = activeDetail.PackageDetails.find((item) => item.ListingPropertyCode === code)

            if (!matchedSKU) {
                setScanError('SKU không có trong kiện này')
                return
            }

            dispatch(incrementSKU(code))
        },
        [activeDetail, dispatch, isRemoveMode, scanInputType, selectedShippingProviderId],
    )

    const handleHandoverScan = useCallback(
        (code: string) => {
            const shippingUnitId = requireShippingProvider()

            if (!shippingUnitId) {
                return
            }

            const payload = {
                ...buildScanPayload(code, scanInputType),
                ShippingUnitId: shippingUnitId,
            }

            if (isRemoveMode) {
                void dispatch(removeHandoverRecord(payload))
                return
            }

            void dispatch(addHandoverRecord(payload))
        },
        [dispatch, isRemoveMode, requireShippingProvider, scanInputType],
    )

    const handleReturnScan = useCallback(
        (code: string) => {
            const shippingUnitId = requireShippingProvider()

            if (!shippingUnitId) {
                return
            }

            const payload = {
                ...buildScanPayload(code, scanInputType),
                ShippingUnitId: shippingUnitId,
            }

            if (isRemoveMode) {
                void dispatch(removeReturnRecord(payload))
                return
            }

            void dispatch(loadReturnDetail(payload))
        },
        [dispatch, isRemoveMode, requireShippingProvider, scanInputType],
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
