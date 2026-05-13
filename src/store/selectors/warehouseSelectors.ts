import type { RootState } from '@/store/store'

export const selectWarehouseState = (state: RootState) => state.warehouse

export const selectWarehouseOperationConfig = (state: RootState) => state.warehouse.operationConfig

export const selectWarehouseHasLayout = (state: RootState) => state.warehouse.operationConfig?.HasLayout ?? false

export const selectShippingProviders = (state: RootState) => state.warehouse.providers

export const selectIsLoadingWarehouseConfig = (state: RootState) => state.warehouse.isLoadingConfig

export const selectIsLoadingShippingProviders = (state: RootState) => state.warehouse.isLoadingProviders

export const selectWarehouseConfigError = (state: RootState) => state.warehouse.configError

export const selectShippingProvidersError = (state: RootState) => state.warehouse.providersError
