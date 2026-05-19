import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { returnService } from '@/services/return'
import { createAppAsyncThunk } from '@/store/thunkTypes'
import type {
    IConfirmReturnRequest,
    IGetReturnDetailRequest,
    IGetReturnListRequest,
    IGetReturnStatsRequest,
    IRemoveReturnRequest,
} from '@/models/return/ReturnDTO'
import type {
    IReturnDetail,
    IReturnFilters,
    IReturnRecord,
    IReturnStats,
} from '@/models/return/ReturnInterface'

//#region helpers
const toErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message
    }

    return fallback
}

function requiresShippingUnit(request: { Type: string; ShippingUnitId?: string }): boolean {
    return request.Type !== 'DELIVERYCODE' && !request.ShippingUnitId?.trim()
}

function hasReturnItems(request: Pick<IConfirmReturnRequest, 'ListItems'>): boolean {
    return request.ListItems.length > 0
}

function hasContainer(request: Pick<IConfirmReturnRequest, 'ContainerId' | 'ContainerCode'>): boolean {
    return Boolean(request.ContainerId && request.ContainerId > 0 && request.ContainerCode?.trim())
}

function getRecordKey(record: IReturnRecord): string {
    return (
        record.DeliveryCode ||
        record.PackageCode ||
        record.OrderCode ||
        record.Id ||
        ''
    )
}

function getRequestKey(request: IRemoveReturnRequest): string {
    return (
        request.DeliveryCode ||
        request.PackageCode ||
        request.OrderCode ||
        request.OrderCodeRef ||
        ''
    )
}

function prependReturnRecords(
    currentRecords: IReturnRecord[],
    newRecords: IReturnRecord[],
): IReturnRecord[] {
    const newRecordKeys = new Set(newRecords.map(getRecordKey))
    const filteredCurrentRecords = currentRecords.filter((record) => {
        const key = getRecordKey(record)

        return !key || !newRecordKeys.has(key)
    })

    return [...newRecords, ...filteredCurrentRecords]
}
//#endregion helpers

//#region states
const defaultFilters: IReturnFilters = {
    PageIndex: 1,
    PageSize: 10,
}

export interface IReturnState {
    activeReturn: IReturnDetail | null
    activeScanPayload: IGetReturnDetailRequest | null
    records: IReturnRecord[]
    totalRows: number
    filters: IReturnFilters
    returnStats: IReturnStats | null
    isLoadingDetail: boolean
    isFetchingList: boolean
    isLoadingStats: boolean
    isConfirming: boolean
    isRemoving: boolean
    error: string | null
}

const initialState: IReturnState = {
    activeReturn: null,
    activeScanPayload: null,
    records: [],
    totalRows: 0,
    filters: defaultFilters,
    returnStats: null,
    isLoadingDetail: false,
    isFetchingList: false,
    isLoadingStats: false,
    isConfirming: false,
    isRemoving: false,
    error: null,
}
//#endregion states

//#region thunks
export const loadReturnDetail = createAppAsyncThunk(
    'returnDelivery/loadReturnDetail',
    async (request: IGetReturnDetailRequest, { rejectWithValue }) => {
        if (requiresShippingUnit(request)) {
            return rejectWithValue(
                'Mã này cần chọn đơn vị vận chuyển trước khi nhận hoàn. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
        }

        try {
            return await returnService.getReturnDetail(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Không thể tải chi tiết hàng hoàn'))
        }
    },
)

export const confirmReturn = createAppAsyncThunk(
    'returnDelivery/confirmReturn',
    async (request: IConfirmReturnRequest, { rejectWithValue }) => {
        if (requiresShippingUnit(request)) {
            return rejectWithValue(
                'Mã này cần chọn đơn vị vận chuyển trước khi xác nhận hoàn. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
        }

        if (!hasContainer(request)) {
            return rejectWithValue('Vui lòng quét đơn vị chứa trước khi xác nhận hoàn')
        }

        if (!hasReturnItems(request)) {
            return rejectWithValue('Danh sách hàng hoàn không được để trống')
        }

        try {
            return await returnService.confirmReturn(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Không thể xác nhận hàng hoàn'))
        }
    },
)

export const confirmReturnNoLayout = createAppAsyncThunk(
    'returnDelivery/confirmReturnNoLayout',
    async (request: IConfirmReturnRequest, { rejectWithValue }) => {
        if (requiresShippingUnit(request)) {
            return rejectWithValue(
                'Mã này cần chọn đơn vị vận chuyển trước khi xác nhận hoàn. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
        }

        if (!hasReturnItems(request)) {
            return rejectWithValue('Danh sách hàng hoàn không được để trống')
        }

        try {
            return await returnService.confirmReturnNoLayout(request)
        } catch (error) {
            return rejectWithValue(
                toErrorMessage(error, 'Không thể xác nhận hàng hoàn không layout'),
            )
        }
    },
)

export const removeReturnRecord = createAppAsyncThunk(
    'returnDelivery/removeReturnRecord',
    async (request: IRemoveReturnRequest, { rejectWithValue }) => {
        if (requiresShippingUnit(request)) {
            return rejectWithValue(
                'Mã này cần chọn đơn vị vận chuyển trước khi xóa hàng hoàn. Mã vận đơn sẽ tự xác định đơn vị vận chuyển.',
            )
        }

        try {
            return await returnService.removeReturnRecord(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Không thể xóa record hàng hoàn'))
        }
    },
)

export const fetchReturnList = createAppAsyncThunk(
    'returnDelivery/fetchReturnList',
    async (request: IGetReturnListRequest, { rejectWithValue }) => {
        try {
            return await returnService.getReturnList(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Không thể tải danh sách hàng hoàn'))
        }
    },
)

export const loadReturnStats = createAppAsyncThunk(
    'returnDelivery/loadReturnStats',
    async (request: IGetReturnStatsRequest | undefined, { rejectWithValue }) => {
        try {
            return await returnService.getReturnStats(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Không thể tải thống kê hàng hoàn'))
        }
    },
)
//#endregion thunks

//#region slice
const returnSlice = createSlice({
    name: 'returnDelivery',
    initialState,
    reducers: {
        clearReturnError(state) {
            state.error = null
        },

        clearActiveReturn(state) {
            state.activeReturn = null
            state.activeScanPayload = null
            state.error = null
        },

        clearReturnRecords(state) {
            state.records = []
            state.totalRows = 0
            state.error = null
        },

        setReturnFilters(state, action: PayloadAction<Partial<IReturnFilters>>) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            }
        },

        resetReturnFilters(state) {
            state.filters = defaultFilters
        },
    },
    extraReducers: (builder) => {
        builder
            //#region load return detail
            .addCase(loadReturnDetail.pending, (state) => {
                state.isLoadingDetail = true
                state.error = null
            })
            .addCase(loadReturnDetail.fulfilled, (state, action) => {
                state.isLoadingDetail = false
                state.activeReturn = action.payload
                state.activeScanPayload = action.meta.arg
            })
            .addCase(loadReturnDetail.rejected, (state, action) => {
                state.isLoadingDetail = false
                state.error = action.payload ?? 'Không thể tải chi tiết hàng hoàn'
            })
            //#endregion load return detail

            //#region confirm return
            .addCase(confirmReturn.pending, (state) => {
                state.isConfirming = true
                state.error = null
            })
            .addCase(confirmReturn.fulfilled, (state, action) => {
                state.isConfirming = false
                state.activeReturn = null
                state.activeScanPayload = null
                state.records = prependReturnRecords(state.records, action.payload)
                state.totalRows += action.payload.length
            })
            .addCase(confirmReturn.rejected, (state, action) => {
                state.isConfirming = false
                state.error = action.payload ?? 'Không thể xác nhận hàng hoàn'
            })
            //#endregion confirm return

            //#region confirm return no layout
            .addCase(confirmReturnNoLayout.pending, (state) => {
                state.isConfirming = true
                state.error = null
            })
            .addCase(confirmReturnNoLayout.fulfilled, (state, action) => {
                state.isConfirming = false
                state.activeReturn = null
                state.activeScanPayload = null
                state.records = prependReturnRecords(state.records, action.payload)
                state.totalRows += action.payload.length
            })
            .addCase(confirmReturnNoLayout.rejected, (state, action) => {
                state.isConfirming = false
                state.error = action.payload ?? 'Không thể xác nhận hàng hoàn không layout'
            })
            //#endregion confirm return no layout

            //#region remove return record
            .addCase(removeReturnRecord.pending, (state) => {
                state.isRemoving = true
                state.error = null
            })
            .addCase(removeReturnRecord.fulfilled, (state, action) => {
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
            .addCase(removeReturnRecord.rejected, (state, action) => {
                state.isRemoving = false
                state.error = action.payload ?? 'Không thể xóa record hàng hoàn'
            })
            //#endregion remove return record

            //#region fetch return list
            .addCase(fetchReturnList.pending, (state) => {
                state.isFetchingList = true
                state.error = null
            })
            .addCase(fetchReturnList.fulfilled, (state, action) => {
                state.isFetchingList = false
                state.records = action.payload.Data
                state.totalRows = action.payload.TotalRows
                state.filters = {
                    ...state.filters,
                    PageIndex: action.payload.PageIndex,
                    PageSize: action.payload.PageSize,
                }
            })
            .addCase(fetchReturnList.rejected, (state, action) => {
                state.isFetchingList = false
                state.error = action.payload ?? 'Không thể tải danh sách hàng hoàn'
            })
            //#endregion fetch return list

            //#region load return stats
            .addCase(loadReturnStats.pending, (state) => {
                state.isLoadingStats = true
                state.error = null
            })
            .addCase(loadReturnStats.fulfilled, (state, action) => {
                state.isLoadingStats = false
                state.returnStats = action.payload
            })
            .addCase(loadReturnStats.rejected, (state, action) => {
                state.isLoadingStats = false
                state.error = action.payload ?? 'Không thể tải thống kê hàng hoàn'
            })
        //#endregion load return stats
    },
})
//#endregion slice

//#region exports
export const {
    clearActiveReturn,
    clearReturnError,
    clearReturnRecords,
    resetReturnFilters,
    setReturnFilters,
} = returnSlice.actions

export default returnSlice.reducer
//#endregion exports
