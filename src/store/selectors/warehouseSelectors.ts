import type { RootState } from '@/store/store'

//#region base selectors
export const selectWarehouseState = (state: RootState) => state.warehouse

export const selectWarehouseOperationConfig = (state: RootState) => state.warehouse.operationConfig

export const selectShippingProviders = (state: RootState) => state.warehouse.providers
//#endregion base selectors

//#region config selectors
export const selectWarehouseHasLayout = (state: RootState) => state.warehouse.operationConfig?.HasLayout ?? false
//#endregion config selectors

//#region loading selectors
export const selectIsLoadingWarehouseConfig = (state: RootState) => state.warehouse.isLoadingConfig

export const selectIsLoadingShippingProviders = (state: RootState) => state.warehouse.isLoadingProviders
//#endregion loading selectors

//#region error selectors
export const selectWarehouseConfigError = (state: RootState) => state.warehouse.configError

export const selectShippingProvidersError = (state: RootState) => state.warehouse.providersError
//#endregion error selectors

//#region shipping provider lookup selectors
export const selectShippingProviderById =
    (providerId: string | null | undefined) =>
    (state: RootState) => {
        if (!providerId) {
            return undefined
        }

        return state.warehouse.providers.find((provider) => provider.Id === providerId)
    }

export const selectHasShippingProviders = (state: RootState): boolean => {
    return state.warehouse.providers.length > 0
}
//#endregion shipping provider lookup selectors
