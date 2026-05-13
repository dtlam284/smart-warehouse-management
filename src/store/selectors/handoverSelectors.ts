import type { 
    HandoverRecord, 
    ProviderProgress 
} from '@/models/handover/HandoverInterface'
import type { RootState } from '@/store/store'

//#region base selectors
export const selectHandoverState = (state: RootState) => state.handover

export const selectHandoverRecords = (state: RootState) => state.handover.records

export const selectHandoverTotalRows = (state: RootState) => state.handover.totalRows

export const selectHandoverFilters = (state: RootState) => state.handover.filters

export const selectHandoverStats = (state: RootState) => state.handover.handoverStats
//#endregion base selectors

//#region loading selectors
export const selectIsFetchingHandoverList = (state: RootState) => state.handover.isFetchingList

export const selectIsLoadingHandoverStats = (state: RootState) => state.handover.isLoadingStats

export const selectIsUpdatingHandover = (state: RootState) => state.handover.isUpdating

export const selectIsRemovingHandover = (state: RootState) => state.handover.isRemoving
//#endregion loading selectors

//#region error selectors
export const selectHandoverError = (state: RootState) => state.handover.error
//#endregion error selectors

//#region record lookup selectors
export const selectHandoverRecordByDeliveryCode =
    (deliveryCode: string) =>
    (state: RootState): HandoverRecord | undefined => {
        return state.handover.records.find((record) => record.DeliveryCode === deliveryCode)
    }

export const selectHasHandoverRecordByDeliveryCode =
    (deliveryCode: string) =>
    (state: RootState): boolean => {
        return state.handover.records.some((record) => record.DeliveryCode === deliveryCode)
    }
//#endregion record lookup selectors

//#region provider progress selectors
export const selectProviderProgressList = (state: RootState): ProviderProgress[] => {
    return state.handover.handoverStats?.Statistics ?? []
}

export const selectProviderProgressByShippingUnitId =
    (shippingUnitId: string) =>
    (state: RootState): ProviderProgress | undefined => {
        return state.handover.handoverStats?.Statistics.find(
            (progress) => progress.ShippingUnitId === shippingUnitId,
        )
    }
//#endregion provider progress selectors

//#region derived totals
export const selectTotalHandoverCount = (state: RootState): number => {
    return (
        state.handover.handoverStats?.Statistics.reduce((total, progress) => {
            return total + progress.TotalHandover
        }, 0) ?? 0
    )
}

export const selectTotalHandoverSalesOrderCount = (state: RootState): number => {
    return (
        state.handover.handoverStats?.Statistics.reduce((total, progress) => {
            return total + progress.TotalSalesOrder
        }, 0) ?? 0
    )
}
//#endregion derived totals
