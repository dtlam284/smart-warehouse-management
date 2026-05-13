import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { handoverService } from '@/services/handover/handoverService'
import { createAppAsyncThunk } from '@/store/thunkTypes'
import { toErrorMessage } from './sliceUtils'
import type {
    GetHandoverListRequest,
    GetHandoverStatsRequest,
    RemoveHandoverRequest,
    UpdateHandoverRequest,
} from '@/models/handover/HandoverDTO'
import type {
    HandoverFilters,
    HandoverRecord,
    HandoverStats,
} from '@/models/handover/HandoverInterface'

//#region helpers
function hasShippingUnitId(request: Pick<UpdateHandoverRequest, 'ShippingUnitId'>): boolean {
    return request.ShippingUnitId.trim().length > 0
}

function getDeliveryCodesFromRecords(records: HandoverRecord[]): string[] {
    return records.map((record) => record.DeliveryCode).filter((code) => code.trim().length > 0)
}

function prependHandoverRecords(currentRecords: HandoverRecord[], newRecords: HandoverRecord[]): HandoverRecord[] {
    const newDeliveryCodes = new Set(getDeliveryCodesFromRecords(newRecords))
    const filteredCurrentRecords = currentRecords.filter((record) => !newDeliveryCodes.has(record.DeliveryCode))

    return [...newRecords, ...filteredCurrentRecords]
}
//#endregion helpers

//#region states
const defaultFilters: HandoverFilters = {
    PageIndex: 0,
    PageSize: 20,
}

export interface IHandoverState {
    records: HandoverRecord[]
    totalRows: number
    filters: HandoverFilters
    handoverStats: HandoverStats | null
    isFetchingList: boolean
    isLoadingStats: boolean
    isUpdating: boolean
    isRemoving: boolean
    error: string | null
}

const initialState: IHandoverState = {
    records: [],
    totalRows: 0,
    filters: defaultFilters,
    handoverStats: null,
    isFetchingList: false,
    isLoadingStats: false,
    isUpdating: false,
    isRemoving: false,
    error: null,
}
//#endregion states

//#region thunks
export const addHandoverRecord = createAppAsyncThunk(
    'handover/addHandoverRecord',
    async (request: UpdateHandoverRequest, { rejectWithValue }) => {
        if (!hasShippingUnitId(request)) {
            return rejectWithValue('Please select a shipping unit before delivery. (Vui lòng chọn đơn vị vận chuyển trước khi bàn giao.)')
        }

        try {
            return await handoverService.addHandoverRecord(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Unable to record handover. (Không thể ghi nhận bàn giao.)'))
        }
    },
)

export const removeHandoverRecord = createAppAsyncThunk(
    'handover/removeHandoverRecord',
    async (request: RemoveHandoverRequest, { rejectWithValue }) => {
        if (!hasShippingUnitId(request)) {
            return rejectWithValue('Please select a shipping unit before deleting the handover. (Vui lòng chọn đơn vị vận chuyển trước khi xóa bàn giao.)')
        }

        try {
            return await handoverService.removeHandoverRecord(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Unable to delete handover record. (Không thể xóa record bàn giao.)'))
        }
    },
)

export const fetchHandoverList = createAppAsyncThunk(
    'handover/fetchHandoverList',
    async (request: GetHandoverListRequest, { rejectWithValue }) => {
        try {
            return await handoverService.getHandoverList(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Unable to load handover list. (Không thể tải danh sách bàn giao.)'))
        }
    },
)

export const loadHandoverStats = createAppAsyncThunk(
    'handover/loadHandoverStats',
    async (request: GetHandoverStatsRequest | undefined, { rejectWithValue }) => {
        try {
            return await handoverService.getHandoverStats(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Unable to load handover statistics. (Không thể tải thống kê bàn giao.)'))
        }
    },
)
//#endregion thunks

//#region slices
const handoverSlice = createSlice({
    name: 'handover',
    initialState,
    reducers: {
        clearHandoverError(state) {
            state.error = null
        },

        clearHandoverRecords(state) {
            state.records = []
            state.totalRows = 0
            state.error = null
        },

        setHandoverFilters(state, action: PayloadAction<Partial<HandoverFilters>>) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            }
        },

        resetHandoverFilters(state) {
            state.filters = defaultFilters
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addHandoverRecord.pending, (state) => {
                state.isUpdating = true
                state.error = null
            })
            .addCase(addHandoverRecord.fulfilled, (state, action) => {
                state.isUpdating = false
                state.records = prependHandoverRecords(state.records, action.payload)
                state.totalRows += action.payload.length
            })
            .addCase(addHandoverRecord.rejected, (state, action) => {
                state.isUpdating = false
                state.error = action.payload ?? 'Không thể ghi nhận bàn giao'
            })
            .addCase(removeHandoverRecord.pending, (state) => {
                state.isRemoving = true
                state.error = null
            })
            .addCase(removeHandoverRecord.fulfilled, (state, action) => {
                state.isRemoving = false

                const removedCodes = new Set(action.payload)
                const beforeCount = state.records.length

                state.records = state.records.filter((record) => !removedCodes.has(record.DeliveryCode))

                const removedCount = beforeCount - state.records.length

                state.totalRows = Math.max(0, state.totalRows - removedCount)
            })
            .addCase(removeHandoverRecord.rejected, (state, action) => {
                state.isRemoving = false
                state.error = action.payload ?? 'Không thể xóa record bàn giao'
            })
            .addCase(fetchHandoverList.pending, (state) => {
                state.isFetchingList = true
                state.error = null
            })
            .addCase(fetchHandoverList.fulfilled, (state, action) => {
                state.isFetchingList = false
                state.records = action.payload.Data
                state.totalRows = action.payload.TotalRows
                state.filters = {
                    ...state.filters,
                    PageIndex: action.payload.PageIndex,
                    PageSize: action.payload.PageSize,
                }
            })
            .addCase(fetchHandoverList.rejected, (state, action) => {
                state.isFetchingList = false
                state.error = action.payload ?? 'Không thể tải danh sách bàn giao'
            })
            .addCase(loadHandoverStats.pending, (state) => {
                state.isLoadingStats = true
                state.error = null
            })
            .addCase(loadHandoverStats.fulfilled, (state, action) => {
                state.isLoadingStats = false
                state.handoverStats = action.payload
            })
            .addCase(loadHandoverStats.rejected, (state, action) => {
                state.isLoadingStats = false
                state.error = action.payload ?? 'Không thể tải thống kê bàn giao'
            })
    },
})
//#endregion slices

//#region exports
export const {
    clearHandoverError,
    clearHandoverRecords,
    resetHandoverFilters,
    setHandoverFilters,
} = handoverSlice.actions

export default handoverSlice.reducer
//#endregion exports
