import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ScanInputType, WorkMode } from '@/models/common'

//#region interfaces
export interface IAppState {
    initialized: boolean
    pageTitle: string
    isSidebarCollapsed: boolean
    workMode: WorkMode
    scanInputType: ScanInputType
    selectedShippingProviderId: string | null
    selectedShippingProviderName: string | null
    isRemoveMode: boolean
}

interface IShippingProviderPayload {
    Id: string
    Name: string
}
//#endregion interfaces

//#region states
const initialState: IAppState = {
    initialized: false,
    pageTitle: '',
    isSidebarCollapsed: false,
    workMode: 'PACKING',
    scanInputType: 'DELIVERYCODE',
    selectedShippingProviderId: null,
    selectedShippingProviderName: null,
    isRemoveMode: false,
}
//#endregion states

//#region slices
const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setInitialized(state, action: PayloadAction<boolean>) {
            state.initialized = action.payload
        },

        setPageTitle(state, action: PayloadAction<string>) {
            state.pageTitle = action.payload
        },

        setSidebarCollapsed(state, action: PayloadAction<boolean>) {
            state.isSidebarCollapsed = action.payload
        },

        setWorkMode(state, action: PayloadAction<WorkMode>) {
            state.workMode = action.payload
            state.isRemoveMode = false
        },

        setScanInputType(state, action: PayloadAction<ScanInputType>) {
            state.scanInputType = action.payload
        },

        setShippingProvider(state, action: PayloadAction<IShippingProviderPayload>) {
            state.selectedShippingProviderId = action.payload.Id
            state.selectedShippingProviderName = action.payload.Name
        },

        clearShippingProvider(state) {
            state.selectedShippingProviderId = ''
            state.selectedShippingProviderName = ''
        },

        setRemoveMode(state, action: PayloadAction<boolean>) {
            state.isRemoveMode = action.payload
        },

        toggleRemoveMode(state) {
            state.isRemoveMode = !state.isRemoveMode
        },
    },
})
//#endregion slices

//#region exports
export const {
    setInitialized,
    setPageTitle,
    setSidebarCollapsed,
    setWorkMode,
    setScanInputType,
    setShippingProvider,
    clearShippingProvider,
    setRemoveMode,
    toggleRemoveMode,
} = appSlice.actions

export default appSlice.reducer
//#endregion exports
