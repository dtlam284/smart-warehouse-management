import type { RootState } from '@/store/store'

//#region types
export type SKUStatus = 'complete' | 'partial' | 'pending'

export interface ScannedProgress {
    scanned: number
    total: number
}
//#endregion types

//#region base selectors
export const selectPackingState = (state: RootState) => state.packing

export const selectPackingActiveDetail = (state: RootState) => state.packing.activeDetail

export const selectPackingActiveScanPayload = (state: RootState) => state.packing.activeScanPayload

export const selectPackingScannedSKUs = (state: RootState) => state.packing.scannedSKUs

export const selectPackingProcessedList = (state: RootState) => state.packing.processedList

export const selectPackingTotalRows = (state: RootState) => state.packing.totalRows

export const selectPackingFilters = (state: RootState) => state.packing.filters

export const selectPackingStats = (state: RootState) => state.packing.packingStats
//#endregion base selectors

//#region loading selectors
export const selectIsLoadingPackageDetails = (state: RootState) => state.packing.isLoadingDetail

export const selectIsFetchingPackingList = (state: RootState) => state.packing.isFetchingList

export const selectIsUpdatingPacking = (state: RootState) => state.packing.isUpdating

export const selectIsRemovingPacking = (state: RootState) => state.packing.isRemoving
//#endregion loading selectors

//#region error selectors
export const selectPackingError = (state: RootState) => state.packing.error
//#endregion error selectors

//#region packing progress selectors
export const selectIsAllItemsHandled = (state: RootState): boolean => {
    const { activeDetail, scannedSKUs } = state.packing

    if (!activeDetail || activeDetail.PackageDetails.length === 0) {
        return false
    }

    return activeDetail.PackageDetails.every((item) => {
        const scannedCount = scannedSKUs[item.ListingPropertyCode] ?? 0

        return scannedCount >= item.Quantity
    })
}

export const selectScannedProgress = (state: RootState): ScannedProgress => {
    const { activeDetail, scannedSKUs } = state.packing

    if (!activeDetail) {
        return {
            scanned: 0,
            total: 0,
        }
    }

    return activeDetail.PackageDetails.reduce<ScannedProgress>(
        (progress, item) => {
            const scannedCount = scannedSKUs[item.ListingPropertyCode] ?? 0

            return {
                scanned: progress.scanned + Math.min(scannedCount, item.Quantity),
                total: progress.total + item.Quantity,
            }
        },
        {
            scanned: 0,
            total: 0,
        },
    )
}
//#endregion packing progress selectors

//#region SKU status selectors
export const selectSKUStatus =
    (sku: string) =>
    (state: RootState): SKUStatus => {
        const { activeDetail, scannedSKUs } = state.packing

        if (!activeDetail) {
            return 'pending'
        }

        const product = activeDetail.PackageDetails.find((item) => item.ListingPropertyCode === sku)

        if (!product) {
            return 'pending'
        }

        const scannedCount = scannedSKUs[sku] ?? 0

        if (scannedCount >= product.Quantity) {
            return 'complete'
        }

        if (scannedCount > 0) {
            return 'partial'
        }

        return 'pending'
    }

export const selectScannedCountBySKU =
    (sku: string) =>
    (state: RootState): number => {
        return state.packing.scannedSKUs[sku] ?? 0
    }

export const selectRequiredCountBySKU =
    (sku: string) =>
    (state: RootState): number => {
        const activeDetail = state.packing.activeDetail

        if (!activeDetail) {
            return 0
        }

        const product = activeDetail.PackageDetails.find((item) => item.ListingPropertyCode === sku)

        return product?.Quantity ?? 0
    }

export const selectIsSKUInActiveDetail =
    (sku: string) =>
    (state: RootState): boolean => {
        const activeDetail = state.packing.activeDetail

        if (!activeDetail) {
            return false
        }

        return activeDetail.PackageDetails.some((item) => item.ListingPropertyCode === sku)
    }
//#endregion SKU status selectors
