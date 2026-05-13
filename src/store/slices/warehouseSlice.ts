import { createSlice } from '@reduxjs/toolkit'
import { warehouseService } from '@/services/warehouse/warehouseService'
import { createAppAsyncThunk } from '@/store/thunkTypes'
import type { ShippingProvider, WarehouseOperationConfig } from '@/models/warehouse/WarehouseInterface'

const toErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message
    }

    return fallback
}

export interface IWarehouseState {
    operationConfig: WarehouseOperationConfig | null
    providers: ShippingProvider[]
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
                state.providers = action.payload
            })
            .addCase(loadShippingProviders.rejected, (state, action) => {
                state.isLoadingProviders = false
                state.providersError = action.payload ?? 'Không thể tải danh sách đơn vị vận chuyển'
            })
    },
})

export const { clearWarehouseErrors, clearWarehouseConfig } = warehouseSlice.actions

export default warehouseSlice.reducer
