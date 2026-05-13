import type { RootState } from '@/store/store'

//#region app state
export const selectAppState = (state: RootState) => state.app

export const selectInitialized = (state: RootState) => state.app.initialized

export const selectPageTitle = (state: RootState) => state.app.pageTitle

export const selectIsSidebarCollapsed = (state: RootState) => state.app.isSidebarCollapsed
//#endregion app state

//#region workflow preferences
export const selectWorkMode = (state: RootState) => state.app.workMode

export const selectScanInputType = (state: RootState) => state.app.scanInputType

export const selectIsRemoveMode = (state: RootState) => state.app.isRemoveMode
//#endregion workflow preferences

//#region shipping provider selection
export const selectSelectedShippingProviderId = (state: RootState) =>
    state.app.selectedShippingProviderId

export const selectSelectedShippingProviderName = (state: RootState) =>
    state.app.selectedShippingProviderName
//#endregion shipping provider selection