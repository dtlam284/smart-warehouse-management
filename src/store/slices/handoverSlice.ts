import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { handoverService } from '@/services/handover/handoverService'
import { createAppAsyncThunk } from '@/store/thunkTypes'
import { toErrorMessage } from './sliceUtils'
import type {
    IGetHandoverListRequest,
    IGetHandoverStatsRequest,
    IRemoveHandoverRequest,
    IUpdateHandoverRequest,
} from '@/models/handover/HandoverDTO'
import type {
    IHandoverFilters,
    IHandoverRecord,
    IHandoverStats,
} from '@/models/handover/HandoverInterface'

//#region helpers
function requiresShippingUnit(request: { Type: string; ShippingUnitId?: string }): boolean {
    return request.Type !== 'DELIVERYCODE' && !request.ShippingUnitId?.trim()
}

function getRecordKey(record: IHandoverRecord): string {
    return [
        record.DeliveryCode,
        record.PackageCode,
        record.OrderCode,
        record.Id,
    ].find((value): value is string => Boolean(value?.trim())) ?? ''
}

function getFirstStringValue(value: string | string[] | undefined): string {
    if (Array.isArray(value)) {
        return value[0] ?? ''
    }

    return value ?? ''
}

function getRequestKey(request: IRemoveHandoverRequest): string {
    return (
        getFirstStringValue(request.DeliveryCodes) ||
        getFirstStringValue(request.DeliveryCodes) ||
        getFirstStringValue(request.PackageCode) ||
        getFirstStringValue(request.PackageCode ? request.PackageCode : undefined) ||
        getFirstStringValue(request.OrderCode) ||
        getFirstStringValue(request.OrderCodeRef) ||
        ''
    )
}

function getRecordKeys(records: IHandoverRecord[]): string[] {
    return records.map(getRecordKey).filter((key) => key.trim().length > 0)
}

function prependHandoverRecords(
    currentRecords: IHandoverRecord[],
    newRecords: IHandoverRecord[],
): IHandoverRecord[] {
    const newRecordKeys = new Set(getRecordKeys(newRecords))
    const filteredCurrentRecords = currentRecords.filter(
        (record) => !newRecordKeys.has(getRecordKey(record)),
    )

    return [...newRecords, ...filteredCurrentRecords]
}
//#endregion helpers

//#region states
const defaultFilters: IHandoverFilters = {
    PageIndex: 1,
    PageSize: 10,
}

export interface IHandoverState {
    records: IHandoverRecord[]
    totalRows: number
    filters: IHandoverFilters
    handoverStats: IHandoverStats | null
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
    async (request: IUpdateHandoverRequest, { rejectWithValue }) => {
        if (requiresShippingUnit(request)) {
            return rejectWithValue(
                'Mã này cần chọn đơn vị vận chuyển trước khi bàn giao. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
        }

        try {
            return await handoverService.addHandoverRecord(request)
        } catch (error) {
            return rejectWithValue(
                toErrorMessage(error, 'Unable to record handover. (Không thể ghi nhận bàn giao.)'),
            )
        }
    },
)

export const removeHandoverRecord = createAppAsyncThunk(
    'handover/removeHandoverRecord',
    async (request: IRemoveHandoverRequest, { rejectWithValue }) => {
        if (requiresShippingUnit(request)) {
            return rejectWithValue(
                'Mã này cần chọn đơn vị vận chuyển trước khi xóa bàn giao. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
        }

        try {
            return await handoverService.removeHandoverRecord(request)
        } catch (error) {
            return rejectWithValue(
                toErrorMessage(
                    error,
                    'Unable to delete handover record. (Không thể xóa record bàn giao.)',
                ),
            )
        }
    },
)

export const fetchHandoverList = createAppAsyncThunk(
    'handover/fetchHandoverList',
    async (request: IGetHandoverListRequest, { rejectWithValue }) => {
        try {
            return await handoverService.getHandoverList(request)
        } catch (error) {
            return rejectWithValue(
                toErrorMessage(
                    error,
                    'Unable to load handover list. (Không thể tải danh sách bàn giao.)',
                ),
            )
        }
    },
)

export const loadHandoverStats = createAppAsyncThunk(
    'handover/loadHandoverStats',
    async (request: IGetHandoverStatsRequest | undefined, { rejectWithValue }) => {
        try {
            return await handoverService.getHandoverStats(request)
        } catch (error) {
            return rejectWithValue(
                toErrorMessage(
                    error,
                    'Unable to load handover statistics. (Không thể tải thống kê bàn giao.)',
                ),
            )
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

        setHandoverFilters(state, action: PayloadAction<Partial<IHandoverFilters>>) {
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

                const beforeCount = state.records.length

                state.records = prependHandoverRecords(state.records, action.payload)

                const addedCount = state.records.length - beforeCount

                state.totalRows = Math.max(state.totalRows + addedCount, state.records.length)
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

                const removedKeys = new Set(action.payload)
                const requestKey = getRequestKey(action.meta.arg)
                const beforeCount = state.records.length

                state.records = state.records.filter((record) => {
                    const recordKey = getRecordKey(record)

                    return !removedKeys.has(recordKey) && recordKey !== requestKey
                })

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
