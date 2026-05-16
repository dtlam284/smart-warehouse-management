import { useCallback, useEffect, useRef, useState } from 'react'
import { buildScanPayload } from '@/models/common'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    selectIsRemoveMode,
    selectScanInputType,
    selectSelectedShippingProviderId,
    selectWorkMode,
} from '@/store/selectors/appSelectors'
import {
    addHandoverRecord,
    fetchHandoverList,
    loadHandoverStats,
    removeHandoverRecord,
} from '@/store/slices/handoverSlice'
import {
    cancelPacking,
    incrementSKU,
    loadPackageDetails,
} from '@/store/slices/packingSlice'
import { showNotification } from '@/store/slices/notificationSlice'
import { selectHandoverFilters } from '@/store/selectors/handoverSelectors'
import {
    selectPackingActiveDetail,
    selectPackingScannedSKUs,
} from '@/store/selectors/packingSelectors'
import {
    loadReturnDetail,
    removeReturnRecord,
} from '@/store/slices/returnSlice'

//#region types
interface IUseScanProcessorResult {
    scanError: string | null
    clearScanError: () => void
    handleScan: (code: string) => void
}
//#endregion types

//#region helpers
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
    const scannedSKUs = useAppSelector(selectPackingScannedSKUs)
    const handoverFilters = useAppSelector(selectHandoverFilters)

    const [scanError, setScanError] = useState<string | null>(null)
    const scanErrorTimeoutRef = useRef<number | null>(null)

    const clearScanErrorTimer = useCallback(() => {
        if (scanErrorTimeoutRef.current !== null) {
            window.clearTimeout(scanErrorTimeoutRef.current)
            scanErrorTimeoutRef.current = null
        }
    }, [])

    const showScanError = useCallback(
        (message: string) => {
            clearScanErrorTimer()
            setScanError(message)

            scanErrorTimeoutRef.current = window.setTimeout(() => {
                setScanError(null)
                scanErrorTimeoutRef.current = null
            }, 3500)
        },
        [clearScanErrorTimer],
    )

    const clearScanError = useCallback(() => {
        clearScanErrorTimer()
        setScanError(null)
    }, [clearScanErrorTimer])

    useEffect(() => {
        return () => {
            clearScanErrorTimer()
        }
    }, [clearScanErrorTimer])

    const notify = useCallback(
        (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
            dispatch(
                showNotification({
                    type,
                    message,
                }),
            )
        },
        [dispatch],
    )

    const requireShippingProvider = useCallback((): string | null => {
        if (!selectedShippingProviderId) {
            const message = 'Vui lòng chọn đơn vị vận chuyển'

            showScanError(message)
            notify('error', message)

            return null
        }

        return selectedShippingProviderId
    }, [notify, selectedShippingProviderId, showScanError])

    const handlePackingScan = useCallback(
        (code: string) => {
            const payload = buildScanPayload(code, scanInputType)

            if (isRemoveMode) {
                const removePayload = {
                    ...payload,
                    ShippingUnitId: selectedShippingProviderId ?? '',
                }

                void dispatch(cancelPacking(removePayload))
                    .unwrap()
                    .then(() => {
                        clearScanError()
                        notify('success', `Đã hủy đóng gói ${code}`)
                    })
                    .catch((error) => {
                        const message = getErrorMessage(error, 'Không thể hủy đóng gói')

                        showScanError(message)
                        notify('error', message)
                    })

                return
            }

            if (!activeDetail) {
                void dispatch(loadPackageDetails(payload))
                    .unwrap()
                    .then(() => {
                        clearScanError()
                        notify('info', `Đã tải kiện ${code}`)
                    })
                    .catch((error) => {
                        const message = getErrorMessage(error, `Không tìm thấy kiện ${code}`)

                        showScanError(message)
                        notify('error', message)
                    })

                return
            }

            const matchedSKU = activeDetail.PackageDetails.find(
                (item) => item.ListingPropertyCode === code,
            )

            if (!matchedSKU) {
                const message = `SKU ${code} không có trong kiện này`

                showScanError(message)
                notify('error', message)

                return
            }

            const currentScannedCount = scannedSKUs[matchedSKU.ListingPropertyCode] ?? 0

            if (currentScannedCount >= matchedSKU.Quantity) {
                const message = `SKU ${matchedSKU.ListingPropertyCode} đã đủ số lượng`

                showScanError(message)
                notify('warning', message)

                return
            }

            dispatch(incrementSKU(code))
            clearScanError()
        },
        [
            activeDetail,
            clearScanError,
            dispatch,
            isRemoveMode,
            notify,
            scanInputType,
            scannedSKUs,
            selectedShippingProviderId,
            showScanError,
        ],
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
                    .unwrap()
                    .then(() => {
                        clearScanError()
                        notify('success', `Đã xóa bàn giao ${code}`)

                        void dispatch(
                            fetchHandoverList({
                                PageIndex: 1,
                                PageSize: handoverFilters.PageSize ?? 10,
                                ShippingUnitId: shippingUnitId,
                            }),
                        )

                        void dispatch(loadHandoverStats({}))
                    })
                    .catch((error) => {
                        const message = getErrorMessage(error, 'Không thể xóa bàn giao')

                        showScanError(message)
                        notify('error', message)
                    })

                return
            }

            void dispatch(addHandoverRecord(payload))
                .unwrap()
                .then(() => {
                    clearScanError()
                    notify('success', `Bàn giao ${code} thành công`)

                    void dispatch(
                        fetchHandoverList({
                            PageIndex: 1,
                            PageSize: handoverFilters.PageSize ?? 10,
                            ShippingUnitId: shippingUnitId,
                        }),
                    )

                    void dispatch(loadHandoverStats({}))
                })
                .catch((error) => {
                    const message = getErrorMessage(error, 'Không thể bàn giao đơn hàng')

                    showScanError(message)
                    notify('error', message)
                })
        },
        [
            clearScanError,
            dispatch,
            handoverFilters.PageSize,
            isRemoveMode,
            notify,
            requireShippingProvider,
            scanInputType,
            showScanError,
        ],
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
                    .unwrap()
                    .then(() => {
                        clearScanError()
                        notify('success', `Đã xóa đơn hoàn ${code}`)
                    })
                    .catch((error) => {
                        const message = getErrorMessage(error, 'Không thể xóa đơn hoàn')

                        showScanError(message)
                        notify('error', message)
                    })

                return
            }

            void dispatch(loadReturnDetail(payload))
                .unwrap()
                .then(() => {
                    clearScanError()
                    notify('info', `Đã tải đơn hoàn ${code}`)
                })
                .catch((error) => {
                    const message = getErrorMessage(error, `Không tìm thấy đơn hoàn ${code}`)

                    showScanError(message)
                    notify('error', message)
                })
        },
        [
            clearScanError,
            dispatch,
            isRemoveMode,
            notify,
            requireShippingProvider,
            scanInputType,
            showScanError,
        ],
    )

    const handleScan = useCallback(
        (rawCode: string) => {
            const code = rawCode.trim().toUpperCase()

            if (!code) {
                return
            }

            clearScanError()

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

                case 'NONE': {
                    const message = 'Vui lòng chọn chế độ làm việc trước khi quét'

                    showScanError(message)
                    notify('error', message)
                }
            }
        },
        [
            clearScanError,
            handleHandoverScan,
            handlePackingScan,
            handleReturnScan,
            notify,
            showScanError,
            workMode,
        ],
    )

    return {
        scanError,
        clearScanError,
        handleScan,
    }
}
//#endregion hook
