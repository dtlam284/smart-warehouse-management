import { createSlice } from '@reduxjs/toolkit'
import { warehouseService } from '@/services/warehouse/warehouseService'
import { createAppAsyncThunk } from '@/store/thunkTypes'
import { toErrorMessage } from './sliceUtils'
import type { IShippingProvider, IWarehouseOperationConfig } from '@/models/warehouse/WarehouseInterface'

//#region states
export interface IWarehouseState {
    operationConfig: IWarehouseOperationConfig | null
    providers: IShippingProvider[]
    isLoadingConfig: boolean
    isLoadingProviders: boolean
    configError: string | null
    providersError: string | null
}

const initialState: IWarehouseState = {
    operationConfig: null,
    providers: [],
    isLoadingConfig: false,
    isLoadingProviders: false,
    configError: null,
    providersError: null,
}
//#endregion states

//#region thunks
export const loadWarehouseConfig = createAppAsyncThunk(
    'warehouse/loadWarehouseConfig',
    async (_, { rejectWithValue }) => {
        try {
            return await warehouseService.getConfig()
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Không thể tải cấu hình vận hành kho'))
        }
    },
)

export const loadShippingProviders = createAppAsyncThunk(
    'warehouse/loadShippingProviders',
    async (keyword: string | undefined, { rejectWithValue }) => {
        try {
            return await warehouseService.getShippingProviders(keyword)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Không thể tải danh sách đơn vị vận chuyển'))
        }
    },
)
//#endregion thunks

//#region slices
const warehouseSlice = createSlice({
    name: 'warehouse',
    initialState,
    reducers: {
        clearWarehouseErrors(state) {
            state.configError = null
            state.providersError = null
        },

        clearWarehouseConfig(state) {
            state.operationConfig = null
            state.configError = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadWarehouseConfig.pending, (state) => {
                state.isLoadingConfig = true
                state.configError = null
            })
            .addCase(loadWarehouseConfig.fulfilled, (state, action) => {
                state.isLoadingConfig = false
                state.operationConfig = action.payload
            })
            .addCase(loadWarehouseConfig.rejected, (state, action) => {
                state.isLoadingConfig = false
                state.configError = action.payload ?? 'Không thể tải cấu hình vận hành kho'
            })
            .addCase(loadShippingProviders.pending, (state) => {
                state.isLoadingProviders = true
                state.providersError = null
            })
            .addCase(loadShippingProviders.fulfilled, (state, action) => {
                state.isLoadingProviders = false
                state.providers = Array.isArray(action.payload) ? action.payload : []
            })
            .addCase(loadShippingProviders.rejected, (state, action) => {
                state.isLoadingProviders = false
                state.providersError = action.payload ?? 'Không thể tải danh sách đơn vị vận chuyển'
            })
    },
})
//#endregion slices

//#region exports
export const { 
    clearWarehouseErrors, 
    clearWarehouseConfig 
} = warehouseSlice.actions

export default warehouseSlice.reducer
//#endregion exports
