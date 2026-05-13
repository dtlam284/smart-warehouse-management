import type { RootState } from '@/store/store'

export const selectAppState = (state: RootState) => state.app

export const selectInitialized = (state: RootState) => state.app.initialized

export const selectPageTitle = (state: RootState) => state.app.pageTitle

export const selectIsSidebarCollapsed = (state: RootState) => state.app.isSidebarCollapsed

export const selectWorkMode = (state: RootState) => state.app.workMode

export const selectScanInputType = (state: RootState) => state.app.scanInputType

export const selectSelectedShippingProviderId = (state: RootState) =>
    state.app.selectedShippingProviderId

export const selectSelectedShippingProviderName = (state: RootState) =>
    state.app.selectedShippingProviderName

export const selectIsRemoveMode = (state: RootState) => state.app.isRemoveMode
