import type {
    IReturnProviderStats,
    IReturnRecord,
} from '@/models/return/ReturnInterface'
import type { RootState } from '@/store/store'

//#region base selectors
export const selectReturnState = (state: RootState) => state.returnDelivery

export const selectActiveReturn = (state: RootState) => state.returnDelivery.activeReturn

export const selectActiveReturnScanPayload = (state: RootState) =>
    state.returnDelivery.activeScanPayload

export const selectReturnRecords = (state: RootState) => state.returnDelivery.records

export const selectReturnTotalRows = (state: RootState) => state.returnDelivery.totalRows

export const selectReturnFilters = (state: RootState) => state.returnDelivery.filters

export const selectReturnStats = (state: RootState) => state.returnDelivery.returnStats
//#endregion base selectors

//#region loading selectors
export const selectIsLoadingReturnDetail = (state: RootState) =>
    state.returnDelivery.isLoadingDetail

export const selectIsFetchingReturnList = (state: RootState) =>
    state.returnDelivery.isFetchingList

export const selectIsLoadingReturnStats = (state: RootState) =>
    state.returnDelivery.isLoadingStats

export const selectIsConfirmingReturn = (state: RootState) =>
    state.returnDelivery.isConfirming

export const selectIsRemovingReturn = (state: RootState) => state.returnDelivery.isRemoving
//#endregion loading selectors

//#region error selectors
export const selectReturnError = (state: RootState) => state.returnDelivery.error
//#endregion error selectors

//#region active return selectors
export const selectActiveReturnItems = (state: RootState) =>
    state.returnDelivery.activeReturn?.ListItem ?? []

export const selectActiveReturnType = (state: RootState) =>
    state.returnDelivery.activeReturn?.ReturnType

export const selectHasActiveReturn = (state: RootState): boolean => {
    return state.returnDelivery.activeReturn !== null
}
//#endregion active return selectors

//#region record lookup selectors
export const selectReturnRecordByDeliveryCode =
    (deliveryCode: string) =>
    (state: RootState): IReturnRecord | undefined => {
        return state.returnDelivery.records.find((record) => record.DeliveryCode === deliveryCode)
    }

export const selectHasReturnRecordByDeliveryCode =
    (deliveryCode: string) =>
    (state: RootState): boolean => {
        return state.returnDelivery.records.some((record) => record.DeliveryCode === deliveryCode)
    }
//#endregion record lookup selectors

//#region provider stats selectors
export const selectReturnProviderStats = (state: RootState): IReturnProviderStats[] => {
    return state.returnDelivery.returnStats?.Statistics ?? []
}

export const selectReturnProviderStatsByShippingUnitId =
    (shippingUnitId: string) =>
    (state: RootState): IReturnProviderStats | undefined => {
        return state.returnDelivery.returnStats?.Statistics.find(
            (stat) => stat.ShippingUnitId === shippingUnitId,
        )
    }
//#endregion provider stats selectors

//#region derived totals
export const selectTotalReturnCount = (state: RootState): number => {
    return (
        state.returnDelivery.returnStats?.Statistics.reduce((total, stat) => {
            return total + stat.TotalReturn
        }, 0) ?? 0
    )
}
//#endregion derived totals
