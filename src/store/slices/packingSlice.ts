import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { packingService } from '@/services/packing/packingService'
import { createAppAsyncThunk } from '@/store/thunkTypes'
import { toErrorMessage } from './sliceUtils'
import type {
    IGetPackageDetailsRequest,
    IGetPackingListRequest,
    IGetPackingStatsRequest,
    IRemovePackingRequest,
    IUpdatePackingRequest,
} from '@/models/packing/PackingDTO'
import type {
    IPackingDetail,
    IPackingFilters,
    IPackingRecord,
    IPackingStats,
} from '@/models/packing/PackingInterface'

//#region helpers
function isAllItemsHandled(
    activeDetail: IPackingDetail | null,
    scannedSKUs: Record<string, number>,
): boolean {
    if (!activeDetail || activeDetail.PackageDetails.length === 0) {
        return false
    }

    return activeDetail.PackageDetails.every((item) => {
        const scannedCount = scannedSKUs[item.ListingPropertyCode] ?? 0

        return scannedCount >= item.Quantity
    })
}

function getRecordKey(record: IPackingRecord): string {
    return [
        record.DeliveryCode,
        record.PackageCode,
        record.OrderCode,
        record.Id,
    ].find((value): value is string => Boolean(value?.trim())) ?? ''
}

function getRecordKeys(records: IPackingRecord[]): string[] {
    return records.map(getRecordKey).filter((key) => key.trim().length > 0)
}

function prependPackingRecords(
    currentRecords: IPackingRecord[],
    newRecords: IPackingRecord[],
): IPackingRecord[] {
    const newRecordKeys = new Set(getRecordKeys(newRecords))
    const filteredCurrentRecords = currentRecords.filter(
        (record) => !newRecordKeys.has(getRecordKey(record)),
    )

    return [...newRecords, ...filteredCurrentRecords]
}
//#endregion helpers

//#region states
const defaultFilters: IPackingFilters = {
    PageIndex: 1,
    PageSize: 10,
}

export interface IPackingState {
    activeDetail: IPackingDetail | null
    activeScanPayload: IGetPackageDetailsRequest | null
    scannedSKUs: Record<string, number>
    processedList: IPackingRecord[]
    totalRows: number
    filters: IPackingFilters
    packingStats: IPackingStats | null
    isLoadingDetail: boolean
    isFetchingList: boolean
    isLoadingStats: boolean
    isUpdating: boolean
    isRemoving: boolean
    error: string | null
}

const initialState: IPackingState = {
    activeDetail: null,
    activeScanPayload: null,
    scannedSKUs: {},
    processedList: [],
    totalRows: 0,
    filters: defaultFilters,
    packingStats: null,
    isLoadingDetail: false,
    isFetchingList: false,
    isLoadingStats: false,
    isUpdating: false,
    isRemoving: false,
    error: null,
}
//#endregion states

//#region thunks
export const loadPackageDetails = createAppAsyncThunk(
    'packing/loadPackageDetails',
    async (request: IGetPackageDetailsRequest, { rejectWithValue }) => {
        try {
            return await packingService.getPackageDetails(request)
        } catch (error) {
            return rejectWithValue(
                toErrorMessage(error, 'Không thể tải chi tiết kiện cần đóng gói'),
            )
        }
    },
)

export const completePacking = createAppAsyncThunk(
    'packing/completePacking',
    async (request: IUpdatePackingRequest, { getState, rejectWithValue }) => {
        const state = getState()
        const { activeDetail, scannedSKUs } = state.packing

        if (!isAllItemsHandled(activeDetail, scannedSKUs)) {
            return rejectWithValue(
                'Not enough SKUs have been scanned to complete packaging. (Chưa quét đủ số lượng SKU để hoàn thành đóng gói.)',
            )
        }

        try {
            return await packingService.completePacking(request)
        } catch (error) {
            return rejectWithValue(
                toErrorMessage(error, 'Unable to complete packing. (Không thể hoàn thành đóng gói.)'),
            )
        }
    },
)

export const cancelPacking = createAppAsyncThunk(
    'packing/cancelPacking',
    async (request: IRemovePackingRequest, { rejectWithValue }) => {
        try {
            return await packingService.cancelPacking(request)
        } catch (error) {
            return rejectWithValue(
                toErrorMessage(error, 'Unable to delete packing record. (Không thể xóa record đóng gói.)'),
            )
        }
    },
)

export const fetchPackingList = createAppAsyncThunk(
    'packing/fetchPackingList',
    async (request: IGetPackingListRequest, { rejectWithValue }) => {
        try {
            return await packingService.getPackingList(request)
        } catch (error) {
            return rejectWithValue(
                toErrorMessage(error, 'Unable to load packing list. (Không thể tải danh sách kiện đã đóng.)'),
            )
        }
    },
)

export const loadPackingStats = createAppAsyncThunk(
    'packing/loadPackingStats',
    async (request: IGetPackingStatsRequest | undefined, { rejectWithValue }) => {
        try {
            return await packingService.getPackingStats(request)
        } catch (error) {
            return rejectWithValue(
                toErrorMessage(error, 'Unable to load packing statistics. (Không thể tải thống kê đóng gói.)'),
            )
        }
    },
)
//#endregion thunks

//#region slices
const packingSlice = createSlice({
    name: 'packing',
    initialState,
    reducers: {
        incrementSKU(state, action: PayloadAction<string>) {
            const sku = action.payload.trim()

            if (!sku || !state.activeDetail) {
                return
            }

            const product = state.activeDetail.PackageDetails.find(
                (item) => item.ListingPropertyCode === sku,
            )

            if (!product) {
                return
            }

            const currentCount = state.scannedSKUs[sku] ?? 0

            if (currentCount >= product.Quantity) {
                return
            }

            state.scannedSKUs[sku] = currentCount + 1
        },

        clearPackingError(state) {
            state.error = null
        },

        clearActivePackingDetail(state) {
            state.activeDetail = null
            state.activeScanPayload = null
            state.scannedSKUs = {}
            state.error = null
        },

        resetScannedSKUs(state) {
            state.scannedSKUs = {}
        },

        setPackingFilters(state, action: PayloadAction<Partial<IPackingFilters>>) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            }
        },

        resetPackingFilters(state) {
            state.filters = defaultFilters
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadPackageDetails.pending, (state) => {
                state.isLoadingDetail = true
                state.error = null
            })
            .addCase(loadPackageDetails.fulfilled, (state, action) => {
                state.isLoadingDetail = false
                state.activeDetail = action.payload
                state.activeScanPayload = action.meta.arg
                state.scannedSKUs = {}
            })
            .addCase(loadPackageDetails.rejected, (state, action) => {
                state.isLoadingDetail = false
                state.error = action.payload ?? 'Không thể tải chi tiết kiện cần đóng gói'
            })
            .addCase(completePacking.pending, (state) => {
                state.isUpdating = true
                state.error = null
            })
            .addCase(completePacking.fulfilled, (state, action) => {
                state.isUpdating = false
                state.activeDetail = null
                state.activeScanPayload = null
                state.scannedSKUs = {}

                const beforeCount = state.processedList.length

                state.processedList = prependPackingRecords(state.processedList, action.payload)

                const addedCount = state.processedList.length - beforeCount

                state.totalRows = Math.max(
                    state.totalRows + addedCount,
                    state.processedList.length,
                )
            })
            .addCase(completePacking.rejected, (state, action) => {
                state.isUpdating = false
                state.error = action.payload ?? 'Không thể hoàn thành đóng gói'
            })
            .addCase(cancelPacking.pending, (state) => {
                state.isRemoving = true
                state.error = null
            })
            .addCase(cancelPacking.fulfilled, (state, action) => {
                state.isRemoving = false

                const removedCodes = new Set(action.payload)
                const beforeCount = state.processedList.length

                state.processedList = state.processedList.filter((record) => {
                    return !removedCodes.has(record.DeliveryCode)
                })

                const removedCount = beforeCount - state.processedList.length

                state.totalRows = Math.max(0, state.totalRows - removedCount)
            })
            .addCase(cancelPacking.rejected, (state, action) => {
                state.isRemoving = false
                state.error = action.payload ?? 'Không thể xóa record đóng gói'
            })
            .addCase(fetchPackingList.pending, (state) => {
                state.isFetchingList = true
                state.error = null
            })
            .addCase(fetchPackingList.fulfilled, (state, action) => {
                state.isFetchingList = false

                if (action.payload.Data.length > 0 || state.processedList.length === 0) {
                    state.processedList = action.payload.Data
                    state.totalRows = action.payload.TotalRows
                }

                if (
                    state.filters.PageIndex !== action.payload.PageIndex ||
                    state.filters.PageSize !== action.payload.PageSize
                ) {
                    state.filters = {
                        ...state.filters,
                        PageIndex: action.payload.PageIndex,
                        PageSize: action.payload.PageSize,
                    }
                }
            })
            .addCase(fetchPackingList.rejected, (state, action) => {
                state.isFetchingList = false
                state.error = action.payload ?? 'Không thể tải danh sách kiện đã đóng'
            })
            .addCase(loadPackingStats.pending, (state) => {
                state.isLoadingStats = true
                state.error = null
            })
            .addCase(loadPackingStats.fulfilled, (state, action) => {
                state.isLoadingStats = false
                state.packingStats = action.payload
            })
            .addCase(loadPackingStats.rejected, (state, action) => {
                state.isLoadingStats = false
                state.error = action.payload ?? 'Không thể tải thống kê đóng gói'
            })
    },
})
//#endregion slices

//#region exports
export const {
    clearActivePackingDetail,
    clearPackingError,
    resetPackingFilters,
    resetScannedSKUs,
    setPackingFilters,
    incrementSKU,
} = packingSlice.actions

export default packingSlice.reducer
//#endregion exports
