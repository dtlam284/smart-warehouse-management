import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { packingService } from '@/services/packing/packingService'
import { createAppAsyncThunk } from '@/store/thunkTypes'
import { toErrorMessage } from './sliceUtils'
import type {
    GetPackageDetailsRequest,
    GetPackingListRequest,
    GetPackingStatsRequest,
    RemovePackingRequest,
    UpdatePackingRequest,
} from '@/models/packing/PackingDTO'
import type {
    PackingDetail,
    PackingFilters,
    PackingRecord,
    PackingStats,
} from '@/models/packing/PackingInterface'

//#region helpers
function isAllItemsHandled(activeDetail: PackingDetail | null, scannedSKUs: Record<string, number>): boolean {
    if (!activeDetail || activeDetail.PackageDetails.length === 0) {
        return false
    }

    return activeDetail.PackageDetails.every((item) => {
        const scannedCount = scannedSKUs[item.ListingPropertyCode] ?? 0

        return scannedCount >= item.Quantity
    })
}

function getDeliveryCodesFromRecords(records: PackingRecord[]): string[] {
    return records.map((record) => record.DeliveryCode).filter((code) => code.trim().length > 0)
}

function prependPackingRecords(currentRecords: PackingRecord[], newRecords: PackingRecord[]): PackingRecord[] {
    const newDeliveryCodes = new Set(getDeliveryCodesFromRecords(newRecords))
    const filteredCurrentRecords = currentRecords.filter((record) => !newDeliveryCodes.has(record.DeliveryCode))

    return [...newRecords, ...filteredCurrentRecords]
}
//#endregion helpers

//#region states
const defaultFilters: PackingFilters = {
    PageIndex: 0,
    PageSize: 20,
}

export interface IPackingState {
    activeDetail: PackingDetail | null
    scannedSKUs: Record<string, number>
    processedList: PackingRecord[]
    totalRows: number
    filters: PackingFilters
    packingStats: PackingStats | null
    isLoadingDetail: boolean
    isFetchingList: boolean
    isLoadingStats: boolean
    isUpdating: boolean
    isRemoving: boolean
    error: string | null
}

const initialState: IPackingState = {
    activeDetail: null,
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
    async (request: GetPackageDetailsRequest, { rejectWithValue }) => {
        try {
            return await packingService.getPackageDetails(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Không thể tải chi tiết kiện cần đóng gói'))
        }
    },
)

export const completePacking = createAppAsyncThunk(
    'packing/completePacking',
    async (request: UpdatePackingRequest, { getState, rejectWithValue }) => {
        const state = getState()
        const { activeDetail, scannedSKUs } = state.packing

        if (!isAllItemsHandled(activeDetail, scannedSKUs)) {
            return rejectWithValue('Not enough SKUs have been scanned to complete packaging. (Chưa quét đủ số lượng SKU để hoàn thành đóng gói.)')
        }

        try {
            return await packingService.completePacking(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Unable to complete packing. (Không thể hoàn thành đóng gói.)'))
        }
    },
)

export const cancelPacking = createAppAsyncThunk(
    'packing/cancelPacking',
    async (request: RemovePackingRequest, { rejectWithValue }) => {
        try {
            return await packingService.cancelPacking(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Unable to delete packing record. (Không thể xóa record đóng gói.)'))
        }
    },
)

export const fetchPackingList = createAppAsyncThunk(
    'packing/fetchPackingList',
    async (request: GetPackingListRequest, { rejectWithValue }) => {
        try {
            return await packingService.getPackingList(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Unable to load packing list. (Không thể tải danh sách kiện đã đóng.)'))
        }
    },
)

export const loadPackingStats = createAppAsyncThunk(
    'packing/loadPackingStats',
    async (request: GetPackingStatsRequest | undefined, { rejectWithValue }) => {
        try {
            return await packingService.getPackingStats(request)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Unable to load packing statistics. (Không thể tải thống kê đóng gói.)'))
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

            const product = state.activeDetail.PackageDetails.find((item) => item.ListingPropertyCode === sku)

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
            state.scannedSKUs = {}
            state.error = null
        },

        resetScannedSKUs(state) {
            state.scannedSKUs = {}
        },

        setPackingFilters(state, action: PayloadAction<Partial<PackingFilters>>) {
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
                state.scannedSKUs = {}
                state.processedList = prependPackingRecords(state.processedList, action.payload)
                state.totalRows += action.payload.length
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

                state.processedList = state.processedList.filter((record) => !removedCodes.has(record.DeliveryCode))

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
                state.processedList = action.payload.Data
                state.totalRows = action.payload.TotalRows
                state.filters = {
                    ...state.filters,
                    PageIndex: action.payload.PageIndex,
                    PageSize: action.payload.PageSize,
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
    incrementSKU,
    resetPackingFilters,
    resetScannedSKUs,
    setPackingFilters,
} = packingSlice.actions

export default packingSlice.reducer
//#endregion exports
